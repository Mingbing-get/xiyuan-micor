import React from 'react';
import './index.css';

import { Form, Input, Button, message } from 'antd';

import api from '../../../http/api.js';

export default class Updatepassword extends React.Component {

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
        let user = JSON.parse(localStorage.getItem('user'));
        if (user){
            let data = {
                count:user.count,
                ...value
            };
            api.updatepassword(JSON.stringify(data))
                .then(res=>res.json())
                .then(data=>{
                    if (data.status === 1){
                        message.destroy();
                        message.success('密码修改成功!');
                        this.props.history.go(-1);
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
        const layout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        };
        const tailLayout = {
            wrapperCol: { offset: 4, span: 20 },
        };
        return(
            <Form
                {...layout}
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

                <Form.Item {...tailLayout}>
                    <Button type="primary" htmlType="submit">
                        确认修改
                    </Button>
                </Form.Item>
            </Form>
        );
    }
}