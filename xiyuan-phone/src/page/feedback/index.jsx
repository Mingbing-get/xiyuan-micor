import React from 'react';
import './index.css';

import { Modal, Form, Button, Radio, Input, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import api from "../../http/api";

import NavBar from '../../components/navbar';
import { LeftOutlined } from '@ant-design/icons';

const { TextArea } = Input;

export default class Feedback extends React.Component {
    constructor(props) {
        super(props);
        this.user = JSON.parse(localStorage.getItem('user'));
    }

    componentDidMount(){
        if (!this.user || !this.user.count){
            this.props.history.replace('/login');
            return;
        }
    }
    onFinish = (values)=>{
        if (!values.content){
            message.destroy();
            message.warning('反馈内容不能为空！');
            return;
        }
        Modal.confirm({
            title: '确认反馈?',
            icon: <ExclamationCircleOutlined />,
            content: <div className='comfir-box'>
                <p><span>反馈类型：</span>{this.etoc(values.type)}</p>
                <p><span>反馈内容：</span>{values.content}</p>
            </div>,
            okText:'确认',
            onOk:()=> {
                let data = {...values};
                data.usercount = this.user.count;
                api.feedback(JSON.stringify(data))
                    .then(res=>res.json())
                    .then(data=>{
                        if (data.status === 1){
                            message.destroy();
                            message.success('反馈成功!');
                        }
                        else {
                            message.destroy();
                            message.warning('反馈失败!');
                        }
                    })
                    .catch(error=>{
                        message.destroy();
                        message.warning('反馈失败!');
                    });
            },
            cancelText:'取消',
        });

    };
    etoc = (e)=>{
        let c = '';
        switch (e) {
            case 'problem':
                c = '网站问题';
                break;
            case 'error':
                c = '错误禁止';
                break;
            case 'advise':
                c = '发展建议';
                break;
            default:
                c=e;
                break;
        }
        return c;
    };
    render() {
        return (
            <div className='feedback-box'>
                <NavBar
                    leftContent={<LeftOutlined onClick={() => {this.props.history.goBack();}}/>}
                >意见反馈</NavBar>
                <Form
                    initialValues={{ type: 'problem' }}
                    onFinish={this.onFinish}
                >
                    <Form.Item label="反馈类型：" name="type">
                        <Radio.Group
                            name="type"
                        >
                            <Radio value='problem' >网站问题</Radio>
                            <Radio value='error' >错误禁止</Radio>
                            <Radio value='advise' >发展建议</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item label="反馈内容：" name="content">
                        <TextArea
                            placeholder='请输入要反馈的内容'
                            rows={5}
                        />
                    </Form.Item>
                    <Form.Item
                        className='feedback-btn-box'
                    >
                        <Button
                            type="primary"
                            htmlType="submit"
                        >提交</Button>
                    </Form.Item>
                </Form>
            </div>
        );
    }
}