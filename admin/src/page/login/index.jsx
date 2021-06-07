import React from 'react'
import './index.css';
import {Button, Form, Input, message,Avatar} from "antd";
import { UserOutlined } from '@ant-design/icons';

import api from "../../http/api";

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            touxiang:''
        }
    }

    onFinish = values => {
        api.login(JSON.stringify(values))
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    message.destroy();
                    message.success('登录成功!');
                    sessionStorage.setItem('admin',JSON.stringify(data.admin));
                    this.props.history.push('/index');
                }
                else{
                    message.destroy();
                    message.warning('账户或密码错误!');
                }
            })
            .catch(error=>{
                message.destroy();
                message.warning('账户或密码错误!');
            });
    };
    //账户失去焦点的时候去获取头像
    blur = e=>{
        if (!e.target.value)
            return;
        api.gettouxiang(e.target.value)
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    this.setState({
                        touxiang:data.touxiang
                    });
                }
            })
            .catch(error=>{});
    };
    render() {
        return (
            <div className='login-box'>
                <div>
                    <Avatar
                        size={150}
                        icon={<UserOutlined />}
                        src={this.state.touxiang}
                    />
                    <Form
                        onFinish={this.onFinish}
                    >
                        <Form.Item
                            label="账户："
                            name="count"
                            rules={[{ required: true, message: '请输入账户!' }]}
                        >
                            <Input onBlur={this.blur}/>
                        </Form.Item>

                        <Form.Item
                            label="密码："
                            name="password"
                            rules={[{ required: true, message: '请输入密码!' }]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item style={{textAlign:'center'}}>
                            <Button type="primary" htmlType="submit">
                                登录
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        );
    }
}