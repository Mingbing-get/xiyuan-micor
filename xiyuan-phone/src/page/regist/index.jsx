import React from 'react';
import './index.css';
import { Form, Input, Button, Radio, DatePicker, message } from 'antd';

import 'moment/locale/zh-cn';
import locale from 'antd/lib/date-picker/locale/zh_CN';

import api from '../../http/api.js';

import NavBar from '../../components/navbar';
import { LeftOutlined } from '@ant-design/icons';

export default class Login extends React.Component {
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
        api.isregist(e.target.value)
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
            if (key === 'birthday' || key === 'confirmPassword')
                continue;
            data[key] = values[key];
        }
        if (values.birthday){
            data.birthday = values.birthday._d.format('yyyy-MM-dd');
        }
        api.regist(JSON.stringify(data))
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    message.destroy();
                    message.success('注册成功!');
                    this.props.history.goBack();
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

    onFinishFailed = errorInfo => {
        console.log('Failed:', errorInfo);
    };
    render(){
        return(
            <div className='regist-box'>
                <NavBar
                    leftContent={<LeftOutlined onClick={() => {this.props.history.goBack();}}/>}
                >用户登录</NavBar>
                <Form
                    onFinish={this.onFinish}
                    onFinishFailed={this.onFinishFailed}
                    style={{margin:'0 5px 5px 5px'}}
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
                        label="姓名："
                        name="name"
                        rules={[{ required: true, message: '请输入姓名!' }]}
                    >
                        <Input maxLength={7}/>
                    </Form.Item>

                    <Form.Item
                        label="电话："
                        name="tel"
                        rules={[
                            { required: true, message: '请输入电话!' },
                            { pattern: /^1(3|4|5|6|7|8|9)[0123456789]{9}$/, message: '请输正确的电话!' }
                        ]}
                    >
                        <Input type='tel' maxLength={11}/>
                    </Form.Item>

                    <Form.Item
                        label="邮箱："
                        name="email"
                        rules={[
                            { required: true, message: '请输入邮箱!' },
                            { pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/, message: '请输正确的邮箱!' }
                        ]}
                    >
                        <Input type='email'/>
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
                        label="生日："
                        name="birthday"
                    >
                        <DatePicker
                            locale={locale}
                            placeholder='请选择生日'
                            format='YYYY-MM-DD'
                        />
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

                    <Form.Item className='regist-btn-box'>
                        <Button type="primary" htmlType="submit">
                            注册
                        </Button>
                        <Button type="primary" onClick={()=>{this.props.history.goBack()}}>
                            去登录
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        )
    }
}