import React from 'react';
import './index.css';
import { Form, Input, Button, Radio, message } from 'antd';

import api from '../../../http/api.js';

export default class Addadmin extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            countStatus : ''//validating success error
        };
    }
    countBlur = (e)=>{
        this.setState({
            countStatus: 'validating'
        });
        api.adminisregist(e.target.value)
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    this.setState({
                        countStatus: 'success'
                    });
                }
                else{
                    this.setState({
                        countStatus: 'error'
                    });
                }
            })
            .catch(error=>{
                this.setState({
                    countStatus: 'error'
                });
            });
    };

    onFinish = values => {
        if (values.password !== values.confirmPassword){
            message.destroy();
            message.warning('两次密码不一致!');
            return;
        }
        if (this.state.countStatus !== 'success'){
            message.destroy();
            message.warning('该账户已被注册!');
            return;
        }
        let data = {};
        for (let key in values){
            if (key === 'confirmPassword' || !values[key])
                continue;
            data[key] = values[key];
        }
        api.adminregist(JSON.stringify(data))
            .then(res=>res.json())
            .then(rdata=>{
                if (rdata.status === 1){
                    this.props.zchandleOk && this.props.zchandleOk(data);
                    message.destroy();
                    message.success('注册成功!');
                }
                else {
                    message.destroy();
                    message.error('注册失败!');
                }
            })
            .catch(error=>{
                message.destroy();
                message.error('注册失败!');
            });
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
            >
                <Form.Item
                    label="账户："
                    name="count"
                    rules={[
                        { required: true, message: '请输入账户!' },
                        { min: 5, message: '最少五位!' },
                        { pattern: /^\d+$/, message: '账户只能为数字!' },
                    ]}
                    hasFeedback
                    validateStatus={this.state.countStatus}
                >
                    <Input maxLength={11} onBlur={(e)=>{this.countBlur(e)}}/>
                </Form.Item>

                <Form.Item
                    label="昵称："
                    name="name"
                    rules={[{ required: true, message: '请输入昵称!' }]}
                >
                    <Input maxLength={7}/>
                </Form.Item>

                <Form.Item
                    label="性别："
                    name="sex"
                    rules={[{ required: true, message: '请选择性别!'}]}
                >
                    <Radio.Group>
                        <Radio value='男'>男</Radio>
                        <Radio value='女'>女</Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item
                    label="等级："
                    name="level"
                >
                    <Input type='number'/>
                </Form.Item>

                <Form.Item
                    label="状态："
                    name="status"
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="密码："
                    name="password"
                    rules={[
                        { required: true, message: '请输入密码!' },
                        { min: 6, message: '最少六位!' }
                    ]}
                >
                    <Input.Password maxLength={20}/>
                </Form.Item>

                <Form.Item
                    label="确认密码："
                    name="confirmPassword"
                    rules={[
                        { required: true, message: '请确认密码!' },
                        { min: 6, message: '最少六位!' }
                    ]}
                >
                    <Input.Password maxLength={20}/>
                </Form.Item>

                <Form.Item {...tailLayout}>
                    <Button type="primary" htmlType="submit">
                        确认添加
                    </Button>
                </Form.Item>
            </Form>
        )
    }
}