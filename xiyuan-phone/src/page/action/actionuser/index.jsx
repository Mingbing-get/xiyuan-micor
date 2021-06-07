import React from 'react';
import './index.css';

import { Button, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons'

import api from "../../../http/api";

const { Title } = Typography;

class Actionuser extends React.Component {
    constructor(props){
        super(props);
        this.user = JSON.parse(localStorage.getItem('user'));
        this.state = {
            actionData : {},
            isSelf:false,
            isFollow:false
        }
    }
    componentDidMount(){
        api.getaction(this.props.count)
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    this.props.getActionData && this.props.getActionData(data.data);
                    this.setState({
                        actionData:data.data,
                        isSelf:this.user && this.user.count===data.data.count,
                        isFollow:this.user && data.data.follows && data.data.follows.includes(this.user.count)
                    });
                }
            })
            .catch(error=>{});
    }
    componentWillUpdate(){
        const user = JSON.parse(localStorage.getItem('user'));
        if ((user && !this.user) || (!user && this.user)){
            this.user = user;
            this.setState({
                isSelf:this.user && this.user.count===this.state.actionData.count,
                isFollow:this.user && this.state.actionData.follows && this.state.actionData.follows.includes(this.user.count)
            });
        }
    }
    componentWillUnmount(){
        // 卸载异步操作设置状态
        this.setState = (state, callback) => {
            return;
        }
    }
    sendMessage = ()=>{
        this.props.history.push('/talk/'+this.props.count);
    };
    //点击关注
    followClick = ()=>{
        if (this.islogin() === -1)
            return;
        if (!this.state.actionData.count)
            return;
        api.addfollow(this.state.actionData.count, this.user.count)
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    let newActionData = {...this.state.actionData,follows:[this.user.count,...this.state.actionData.follows]};
                    this.props.getActionData && this.props.getActionData(newActionData);
                    this.setState({
                        isFollow:true,
                        actionData:newActionData
                    });
                }
                else {
                    message.destroy();
                    message.warning('关注失败!');
                }
            })
            .catch(error=>{
                message.destroy();
                message.warning('关注失败!');
            });
    };
    islogin = ()=>{
        if (!this.user) {
            message.destroy();
            message.info('请先登录!');
            this.props.history.push('/login');
            return -1;
        }
        return 1
    };
    render(){
        return(
            <div className='action-user-box'>
                <div
                    className='touxiang'
                    style={{backgroundImage:this.state.actionData.touxiang?'url('+this.state.actionData.touxiang+')':''}}
                ></div>
                <div>
                    <Title level={5}>{this.state.actionData.name}</Title>
                    {
                        !this.state.isSelf &&
                        <div className='btn-box'>
                            <Button onClick={this.sendMessage}>发消息</Button>
                            {
                                this.state.isFollow?
                                    <Button type='primary' disabled>
                                        已关注
                                    </Button>
                                    :
                                    <Button type='primary' onClick={this.followClick}>
                                        <PlusOutlined />关注
                                    </Button>
                            }
                        </div>
                    }
                </div>
            </div>
        )
    }
}
export default Actionuser;