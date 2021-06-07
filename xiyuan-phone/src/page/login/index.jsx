import React from 'react';
import './index.css';

import NavBar from '../../components/navbar';
import { LeftOutlined } from '@ant-design/icons';

import { Form, Input, Button, message } from 'antd';
import api from '../../http/api.js';

import io from 'socket.io-client';

import { connect } from 'react-redux';
import { login, logout } from '../../redux/action/login.js';
import { setSocket, delSocket } from '../../redux/action/socket.js';
import { setNoread, delNoread } from '../../redux/action/noread.js';

class Login extends React.Component {
    constructor(){
        super();
    }
    onFinish = values => {
        api.login(JSON.stringify(values))
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    let socket = io.connect('ws://192.168.1.241:5000');
                    // let socket = io.connect('ws://39.97.168.93:5000');
                    // let socket = io.connect('ws://192.168.1.5:5000');
                    socket.emit('user', data.user.count);//将该用户告诉服务器我是谁
                    //监听有谁给我发消息，收到消息进行之后的处理
                    socket.on('message', (data)=>{
                        if (this.props.noread !== -1)
                            this.props.setNoread(1);
                    });
                    //监听被挤下线
                    socket.on('online',()=> {
                        api.logout()
                            .then(res => res.json())
                            .then(data => {
                                if (data.status === 1) {
                                    alert('您的账号在别处登录，被迫下线');
                                    this.props.logout();
                                    this.props.delSocket();
                                    this.props.delNoread();
                                    localStorage.removeItem('user');
                                }
                            });
                    });

                    this.props.setSocket(socket);
                    this.props.login(data.user);
                    localStorage.setItem('user', JSON.stringify(data.user));

                    message.destroy();
                    message.success('登录成功!');
                    this.props.history.goBack();
                    //去后台获取该用户有多少未读消息
                    return api.getnoreadmun(data.user.count);
                }
                else{
                    message.destroy();
                    message.warning('账户或密码错误!');
                    throw new Error('登录失败');
                }
            })
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    this.props.setNoread(data.number);
                }
            })
            .catch(error=>{});
    };
    toregist = ()=>{
        this.props.history.push('/regist');
    };
    render() {
        return (
            <div className='login-box'>
                <NavBar
                    leftContent={<LeftOutlined onClick={() => {this.props.history.goBack();}}/>}
                >用户登录</NavBar>
                <Form
                    onFinish={this.onFinish}
                    style={{margin:'0 5px'}}
                >
                    <Form.Item
                        label="账户："
                        name="count"
                        rules={[{ required: true, message: '请输入账户!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="密码："
                        name="password"
                        rules={[{ required: true, message: '请输入密码!' }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item className='login-btn-box'>
                        <Button type="primary" htmlType="submit">
                            登录
                        </Button>
                        <Button type="primary" onClick={this.toregist}>
                            去注册
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        user: state.loginReducer,
        socket: state.socketReducer,
        noread: state.noreadReaducer,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        login:(user)=>{ dispatch(login(user)) },
        logout:()=>{ dispatch(logout()) },
        setSocket:(socket)=>{dispatch(setSocket(socket))},
        delSocket:()=>{ dispatch(delSocket()) },
        setNoread:(noread)=>{dispatch(setNoread(noread))},
        delNoread:()=>{ dispatch(delNoread()) },
    }
};

Login = connect(mapStateToProps, mapDispatchToProps)(Login);
export default Login