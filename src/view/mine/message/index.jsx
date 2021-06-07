import React from 'react';
import './index.css';

import { Menu, Badge, Avatar } from 'antd';

import api from '../../../http/api.js';
import Talk from '../../../components/talk';

import { connect } from 'react-redux';
import { setNoread } from '../../../redux/action/noread.js';
import { delNoread } from '../../../redux/action/noread.js';

class Message extends React.Component {
    constructor(props) {
        super(props);
        this.user = JSON.parse(localStorage.getItem('user'));
        this.adddata = false;
        this.state = {
            data:[],
            selectedKeys:'',
            muser:{},
            page:1,
            offset:0,
            messageArray:[],
            more:true
        }
    }

    componentDidMount(){
        this.props.setNoread(-1-this.props.noread);
        const mcount = this.props.match.params.count;
        api.getfirstmessage(this.user.count)
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    //按时间降序排列
                    data.data.sort((a,b)=>{
                        if (new Date(a.time) < new Date(b.time)){
                            return 1;
                        }
                        else {
                            return -1
                        }
                    });
                    if (!mcount){
                        this.setState({
                            data:data.data,
                        });
                        return;
                    }
                    //若传入了一个count表示要与这个人通信，则需要将窗口修改成与这个人的
                    let index = data.data.findIndex(v=>v.muser.count === mcount);
                    if (index === -1){
                        //表示第一次与该人通信，需要去后台获取该人的基本信息
                        api.userbaseinfo(mcount)
                            .then(res=>res.json())
                            .then(result=>{
                                const rdId = 'r'+Math.floor(Math.random()*1243652);
                                this.setState({
                                    data:[{id:rdId, muser:result.data, sender:mcount, resever: this.user.count, content:''},...data.data]
                                });
                                this.handleClick({key:rdId});
                            })
                            .catch(error=>{});
                    }
                    else {
                        //直接选择到这个人
                        this.setState({
                            data:data.data,
                        });
                        this.handleClick({key:''+data.data[index].id});
                    }
                }
            })
            .catch(error=>{});
        this.props.socket && this.props.socket.on('message',this.resever);
    }

    componentWillReceiveProps(newProps) {
        if (!this.props.socket && newProps.socket){
            newProps.socket.on('message',this.resever);
            return false;
        }
        if (newProps.noread && newProps.noread !== -1){
            newProps.setNoread(-1-newProps.noread);
            return false;
        }
    }

    componentWillUnmount(){
        this.props.delNoread();
        this.props.socket && this.props.socket.removeListener("message", this.resever);
    }

    handleClick = (e)=>{
        if (this.adddata || this.state.selectedKeys === e.key)
            return;
        this.adddata = true;
        let index = this.state.data.findIndex(v=>v.id==e.key);
        this.getMessageData(this.state.data[index].sender, this.state.data[index].resever, 1, 0);
        if (this.state.data[index].noread){
            let sender = this.state.data[index].sender===this.user.count?this.state.data[index].resever:this.state.data[index].sender;
            api.markread(sender,this.user.count)
                .then(data=>{})
                .catch(error=>{});
        }
        this.setState({
            selectedKeys:e.key,
            muser:this.state.data[index].muser,
            data:[...this.state.data.slice(0,index),{...this.state.data[index],noread: 0},...this.state.data.slice(index+1)],
            messageArray:[],
            offset:0,
            page:1,
            more:true
        });
    };
    send = (value)=>{
        let data = {
            sender : this.user.count,
            resever : this.state.muser.count,
            content : value,
            time : new Date().format('yyyy-MM-dd hh:mm:ss')
        };
        this.props.socket.emit('message',data);

        let index = this.state.data.findIndex(v=>v.id==this.state.selectedKeys);
        data.image = this.user.touxiang;
        data.displayRight = true;
        data.id = Math.floor(Math.random()*12234512);
        this.setState({
            messageArray:[...this.state.messageArray, data],
            offset : this.state.offset+1,
            data:[{...this.state.data[index], time:data.time, content:data.content},...this.state.data.slice(0,index),...this.state.data.slice(index+1)]
        });
    };
    resever = (data)=>{
        //判断是否在message页面
        let path = this.props.history.location.pathname;
        if (!path.startsWith('/mine/message'))
            return;
        //在message页面 判断目前对话的人是否是正在给我发信息的人
        if (this.state.muser.count === data.sender){
            let index = this.state.data.findIndex(v=>v.id==this.state.selectedKeys);
            data.image = this.state.muser.touxiang;
            this.setState({
                messageArray:[...this.state.messageArray, data],
                offset : this.state.offset+1,
                data:[{...this.state.data[index], time:data.time, content:data.content},...this.state.data.slice(0,index),...this.state.data.slice(index+1)]
            });
            api.markreadbyid(data.id)
                .then(data=>{})
                .catch(error=>{});
        }
        else {
            let index = this.state.data.findIndex(v=>v.muser.count===data.sender);
            if (index !== -1){
                //表示在左边列表中
                let noread = this.state.data[index].noread?this.state.data[index].noread+1:1;
                this.setState({
                    data:[{...this.state.data[index], time:data.time, content:data.content, noread},...this.state.data.slice(0,index),...this.state.data.slice(index+1)]
                });
            }
            else {
                //表示不在左边列表中，(是一个没有发过信息的人，则需要去数据库中获取该人的信息)
                api.userbaseinfo(data.sender)
                    .then(res=>res.json())
                    .then(result=>{
                        if (result.status === 1){
                            data.muser = result.data;
                            data.noread = 1;
                            this.setState({
                                data:[data, ...this.state.data]
                            });
                        }
                    })
                    .catch(error=>{});
            }
        }
    };
    loadMore = (loading, callback)=>{
        if (!this.state.more || this.adddata)
            return;
        loading();
        this.getMessageData(this.state.muser.count, this.user.count, this.state.page, this.state.offset, callback);
    };
    //获取聊天数据
    getMessageData(fcount, lcount, page, offset, callback){
        api.getmessages(fcount, lcount, page, offset)
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    data = data.data.reverse();
                    data.forEach(value=>{
                        if (value.sender===this.user.count){
                            value.displayRight = true;
                            value.image = this.user.touxiang;
                        }
                        else
                            value.image = this.state.muser.touxiang;
                        value.time = new Date(value.time).format('yyyy-MM-dd hh:mm:ss');
                    });
                    this.setState({
                        messageArray:[...data, ...this.state.messageArray],
                        more:data.length >= 20,
                        page:this.state.page+1
                    });
                    callback && callback(data.length >= 20);
                    setTimeout(()=>{
                        this.adddata = false;
                    });
                }
            })
            .catch(error=>{});
    }
    //格式化时间为;MM-dd，前天，昨天，hh:mm
    formartDate(byd, time) {
        let cha = time.getTime() - byd.getTime();
        if (cha < 0)
            return time.format('MM-dd');
        cha = Math.floor(cha /(24*3600000));
        if (cha === 2)
            return time.format('hh:mm');
        if (cha === 1)
            return '昨天';
        return '前天';
    }
    //跳转到某人的主页
    touserClick = (count)=>{
        //如果对方是客服则不能跳转
        if (count === '111111')
            return;
        this.props.history.push('/action/'+count);
    };

    render(){
        const nowtime = new Date();
        const byd = new Date(nowtime.getFullYear(),nowtime.getMonth(), nowtime.getDate()-2);
        return(
            <div className='message-box'>
                <Menu
                    onClick={this.handleClick}
                    className='message-menu'
                    selectedKeys={[this.state.selectedKeys]}
                    mode="inline"
                >
                    {
                        this.state.data.map((value) => {
                            return(
                                <Menu.Item key={value.id}>
                                    <div className='message-muser'>
                                        <div style={{backgroundImage:'url('+value.muser.touxiang+')'}}></div>
                                        <div>
                                            <div className='message-name-time'>
                                                <span>{value.muser.name}</span>
                                                <span>{value.time && this.formartDate(byd,new Date(value.time))}</span>
                                            </div>
                                            <div>
                                                <p>{value.content}</p>
                                                <Badge count={value.noread}></Badge>
                                            </div>
                                        </div>
                                    </div>
                                </Menu.Item>
                            )
                        })
                    }
                </Menu>
                <div className='message-content'>
                    {
                        this.state.selectedKeys &&
                            <Talk
                                header = {<div className='talk-box-header'>
                                    <Avatar
                                        src={this.state.muser.touxiang}
                                        onClick={()=>{this.touserClick(this.state.muser.count)}}
                                    />
                                    <span>{this.state.muser.name}</span>
                                </div>}
                                send={this.send}
                                loadMore={this.loadMore}
                                more={this.state.more}
                                disabled={this.state.muser.count === '111111'}
                                count={this.state.muser.count}
                            >
                                {
                                    this.state.messageArray.map(value=>{
                                        return (
                                            <Talk.TalkItem data={value} key={value.id}/>
                                        )
                                    })
                                }
                            </Talk>
                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        socket: state.socketReducer,
        noread: state.noreadReaducer,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        setNoread:(noread)=>{dispatch(setNoread(noread))},
        delNoread:()=>{dispatch(delNoread())},
    }
};

Message = connect(mapStateToProps, mapDispatchToProps)(Message);
export default Message;