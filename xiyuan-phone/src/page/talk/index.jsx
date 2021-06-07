import React from 'react';
import './index.css';

import NavBar from '../../components/navbar';
import { LeftOutlined, UserOutlined } from '@ant-design/icons';

import TalkBox from '../../components/talk';

import { connect } from 'react-redux';
import { setNoread } from '../../redux/action/noread.js';
import { delNoread } from '../../redux/action/noread.js';

import api from '../../http/api.js';
import {Avatar} from "antd";

class Talk extends React.Component {
    constructor(props) {
        super(props);
        this.user = JSON.parse(localStorage.getItem('user'));
        this.state = {
            messageArray:[],
            more:true,
            page:1,
            offset:0,
            muser:{}
        };
    }
    componentDidMount(){
        if (!this.user || !this.user.count){
            this.props.history.replace('/login');
            return;
        }
        //去后台获取该人的基本信息
        api.userbaseinfo(this.props.match.params.count)
            .then(res=>res.json())
            .then(result=>{
                this.setState({
                    muser:result.data
                });
            })
            .catch(error=>{});
        //获取聊天数据
        this.getMessageData(this.props.match.params.count, this.user.count, 1, 0);
        //将与该人的聊天标记为已读
        api.markread(this.props.match.params.count,this.user.count)
            .then(data=>{})
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
    send = (value)=>{
        let data = {
            sender : this.user.count,
            resever : this.state.muser.count,
            content : value,
            time : new Date().format('yyyy-MM-dd hh:mm:ss')
        };
        this.props.socket.emit('message',data);

        data.image = this.user.touxiang;
        data.displayRight = true;
        data.id = Math.floor(Math.random()*12234512);
        this.setState({
            messageArray:[...this.state.messageArray, data],
            offset : this.state.offset+1
        });
    };
    resever = (data)=>{
        //判断是否在message页面
        let path = this.props.history.location.pathname;
        if (!path.startsWith('/talk'))
            return;
        //在message页面 判断目前对话的人是否是正在给我发信息的人
        if (this.state.muser.count === data.sender){
            data.image = this.state.muser.touxiang;
            this.setState({
                messageArray:[...this.state.messageArray, data],
                offset : this.state.offset+1,
            });
            api.markreadbyid(data.id)
                .then(res=>{})
                .catch(error=>{});
        }
    };
    loadMore = (callback)=>{
        this.getMessageData(this.state.muser.count, this.user.count, this.state.page, this.state.offset, callback);
    };
    //获取聊天数据
    getMessageData(fcount, lcount, page, offset, callback){
        api.getmessages(fcount, lcount, page, offset)
            .then(res=>res.json())
            .then(data=>{
                this.adddata = false;
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
                    callback && callback();
                }
            })
            .catch(error=>{});
    }
    //跳转到某人的主页
    touserClick = (count)=>{
        if (count === '111111')
            return;
        this.props.history.push('/action/'+count);
    };
    render() {
        return (
            <div className='talk-all-box'>
                <NavBar
                    leftContent={<LeftOutlined onClick={() => {this.props.history.goBack();}}/>}
                >
                    <Avatar
                        size={30}
                        icon={<UserOutlined />}
                        src={this.state.muser.touxiang}
                        style={{marginRight:10}}
                        onClick={()=>{this.touserClick(this.state.muser.count)}}
                    />
                    <span>{this.state.muser.name}</span>
                </NavBar>
                <TalkBox
                    header = {false}
                    send={this.send}
                    loadMore={this.loadMore}
                    more={this.state.more}
                    disabled={this.state.muser.count === '111111'}
                >
                    {
                        this.state.messageArray.map(value=>{
                            return (
                                <TalkBox.TalkItem data={value} key={value.id}/>
                            )
                        })
                    }
                </TalkBox>
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

Talk = connect(mapStateToProps, mapDispatchToProps)(Talk);
export default Talk;