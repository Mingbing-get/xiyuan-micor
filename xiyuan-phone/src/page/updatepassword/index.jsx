import React from 'react';
import './index.css';

import NavBar from '../../components/navbar';
import { LeftOutlined } from '@ant-design/icons';
import { Form, Input, Button, message } from 'antd';

import api from '../../http/api.js';

export default class Updatepassword extends React.Component {
    constructor(props) {
        super(props);
        this.user = JSON.parse(localStorage.getItem('user'));
    }
    componentDidMount(){
        if (!this.user || !this.user.count){
            this.props.history.replace('/login');
            return;
        }
    };
    onFinish = (value)=>{
        if (value.password !== value.confirmPassword){
            message.destroy();
            message.warning('两次密码不一致!');
            return;
        }
        if (value.password === value.oldPassword){
            message.destroy();
            message.warning('新旧密码不能相同!');
            return;
        }
        if (this.user){
            let data = {
                count:this.user.count,
                ...value
            };
            api.updatepassword(JSON.stringify(data))
                .then(res=>res.json())
                .then(data=>{
                    if (data.status === 1){
                        message.destroy();
                        message.success('密码修改成功!');
                        this.props.history.goBack();
                    }
                    else {
                        message.destroy();
                        message.warning(data.message);
                    }
                })
                .catch(error=>{
                    message.destroy();
                    message.warning('输入信息不正确!');
                });
        }
    };
    onFinishFailed = ()=>{

    };
    render(){
        return(
            <div className='update-password-box'>
                <NavBar
                    leftContent={<LeftOutlined onClick={() => {this.props.history.goBack();}}/>}
                >修改密码</NavBar>
                <Form
                    onFinish={this.onFinish}
                    onFinishFailed={this.onFinishFailed}
                >
                    <Form.Item
                        label="旧密码："
                        name="oldPassword"
                        rules={[
                            { required: true, message: '请输入旧密码!' },
                            { min: 6, message: '最少六位!' }
                        ]}
                    >
                        <Input.Password maxLength={20}/>
                    </Form.Item>

                    <Form.Item
                        label="新密码："
                        name="password"
                        rules={[
                            { required: true, message: '请输入新密码!' },
                            { min: 6, message: '最少六位!' }
                        ]}
                    >
                        <Input.Password maxLength={20}/>
                    </Form.Item>

                    <Form.Item
                        label="确认新密码："
                        name="confirmPassword"
                        rules={[
                            { required: true, message: '请确认新密码!' },
                            { min: 6, message: '最少六位!' }
                        ]}
                    >
                        <Input.Password maxLength={20}/>
                    </Form.Item>

                    <Form.Item className='update-password-btn-box'>
                        <Button type="primary" block htmlType="submit">
                            确认修改
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        );
    }
}