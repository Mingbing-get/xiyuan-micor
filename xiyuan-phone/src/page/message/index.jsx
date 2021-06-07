import React from 'react';
import './index.css';

import NavBar from '../../components/navbar';
import Loading from '../../components/loading';
import { LeftOutlined } from '@ant-design/icons';
import { Badge } from 'antd';
import Router from '../../router';

import api from '../../http/api.js';

import { connect } from 'react-redux';
import { setNoread, delNoread } from '../../redux/action/noread.js';

class Message extends React.Component {
    constructor(props) {
        super(props);
        this.user = JSON.parse(localStorage.getItem('user'));
        this.state = {
            data:[],
            initing:true
        }
    }
    componentDidMount(){
        if (!this.user || !this.user.count){
            this.props.history.replace('/login');
            return;
        }
        this.props.setNoread(-1-this.props.noread);
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
                    this.setState({
                        data:data.data,
                        initing:false
                    });
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
        // 卸载异步操作设置状态
        this.setState = (state, callback) => {
            return;
        }
    }
    //点击某个聊天，进入聊天框
    handleClick = (id)=>{
        let index = this.state.data.findIndex(v=>v.id==id);
        let sender = this.state.data[index].sender===this.user.count?this.state.data[index].resever:this.state.data[index].sender;
        if (this.state.data[index].noread){
            api.markread(sender,this.user.count)
                .then(data=>{})
                .catch(error=>{});
        }
        this.props.history.push('/talk/'+sender);
    };
    //初始化的时候给socket添加一个on  message事件
    addMessage = ()=>{
        if (!this.props.socket)
            return;
        // if (this.props.socket.json._callbacks.$message)
    };
    resever = (data)=>{
        //判断是否在message页面
        let path = this.props.history.location.pathname;
        if (!path.startsWith('/message'))
            return;
        let index = this.state.data.findIndex(v=>v.muser.count===data.sender);
        if (index !== -1){
            //表示在列表中
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
    };
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
    render() {
        const nowtime = new Date();
        const byd = new Date(nowtime.getFullYear(),nowtime.getMonth(), nowtime.getDate()-2);
        return (
            <div className='message-box'>
                <NavBar
                    leftContent={<LeftOutlined onClick={() => {this.props.history.goBack();}}/>}
                >消息</NavBar>
                <div className='message-muser-all'>
                    {
                        this.state.initing?
                            <Loading/>
                            :
                            this.state.data.map(value=>{
                                return (
                                    <div key={value.id} className='message-muser' onClick={()=>{this.handleClick(value.id)}}>
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
                                )
                            })
                    }
                </div>
                <Router/>
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