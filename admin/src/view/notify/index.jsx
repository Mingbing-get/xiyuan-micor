import React from 'react';
import './index.css';

import { Modal, Form, Button, Radio, Input, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

import api from '../../http/api.js';

const { TextArea } = Input;

export default class Notify extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selecttype:'all',
        }
    }

    radioChange = (e)=>{
        this.setState({
            selecttype: e.target.value
        });
    };
    onFinish = (values)=>{
        if (!values.content){
            message.destroy();
            message.warning('请输入通知内容！');
            return;
        }
        if (values.selecttype==='input' && !values.usercounts){
            message.destroy();
            message.warning('请输入通知的用户账户！');
            return;
        }
        Modal.confirm({
            title: '确认发布该通知?',
            icon: <ExclamationCircleOutlined />,
            content: <div className='comfir-box'>
                <p><span>通知用户：</span>{values.selecttype==='input'?values.usercounts:'所有用户'}</p>
                <p><span>通知标题：</span>{values.title}</p>
                <p><span>通知内容：</span>{values.content}</p>
            </div>,
            okText:'发布',
            onOk() {
                let data = {};
                data.selecttype = values.selecttype;
                if (values.title)
                    data.title = values.title;
                data.content = values.content;
                if (values.selecttype === 'input')
                    data.usercounts = values.usercounts.replace(/，/g,',');
                api.notify(JSON.stringify(data))
                    .then(res=>res.json())
                    .then(data=>{
                        if (data.status === 1){
                            message.destroy();
                            message.success('发布成功!');
                        }
                        else {
                            message.destroy();
                            message.warning('发布失败!');
                        }
                    })
                    .catch(error=>{
                        message.destroy();
                        message.warning('发布失败!');
                    });
            },
            cancelText:'取消',
        });
    };

    render() {
        return (
            <div>
                <Form
                    initialValues={{ selecttype: 'all' }}
                    onFinish={this.onFinish}
                >
                    <Form.Item label="筛选方式：" name="selecttype">
                        <Radio.Group
                            name="selecttype"
                            value={this.state.selecttype}
                            onChange={this.radioChange}
                        >
                            <Radio value='all' >所有用户</Radio>
                            <Radio value='input' >手动输入</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item label="输入用户：" name="usercounts">
                        <TextArea
                            placeholder='请输入要通知用户的id(多个用户以逗号分隔)'
                            rows={3}
                            disabled={this.state.selecttype==='all'}
                        />
                    </Form.Item>
                    <Form.Item label="通知标题：" name="title">
                        <Input
                            placeholder='请输入通知的标题'
                        />
                    </Form.Item>
                    <Form.Item label="通知内容：" name="content">
                        <TextArea
                            placeholder='请输入要通知内容'
                            rows={5}
                        />
                    </Form.Item>
                    <Form.Item
                        style={{textAlign:'center'}}
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