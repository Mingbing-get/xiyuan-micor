import React from 'react';
import './index.css';
import { Form, Input, Button, message } from 'antd';
import api from '../../http/api.js';

import io from 'socket.io-client';

import { connect } from 'react-redux';
import { login } from '../../redux/action/login.js';
import { setSocket } from '../../redux/action/socket.js';
import { setNoread } from '../../redux/action/noread.js';

class Login extends React.Component {
    render(){
        const layout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        };
        const tailLayout = {
            wrapperCol: { offset: 4, span: 20 },
        };

        const onFinish = values => {
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

                        this.props.setSocket(socket);
                        this.props.login(data.user);
                        localStorage.setItem('user', JSON.stringify(data.user));

                        this.props.closeModel && this.props.closeModel();
                        message.destroy();
                        message.success('登录成功!');

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

        const onFinishFailed = errorInfo => {
            console.log('Failed:', errorInfo);
        };

        return(
            <Form
                {...layout}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
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

                <Form.Item {...tailLayout}>
                    <Button type="primary" htmlType="submit">
                        登录
                    </Button>
                </Form.Item>
            </Form>
        )
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
        setSocket:(socket)=>{dispatch(setSocket(socket))},
        setNoread:(noread)=>{dispatch(setNoread(noread))},
    }
};

Login = connect(mapStateToProps, mapDispatchToProps)(Login);
export default Login;