import React from 'react';
import './index.css';

import api from '../../../http/api.js';

import {Button, Form, Input, message, Upload} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
const { TextArea } = Input;

export default class Addmicor extends React.Component {
    constructor(props) {
        super(props);
        this.admin = JSON.parse(sessionStorage.getItem('admin')) || {};
        this.state = {
            randKey: '',
            fileList:[]
        }
    }
    componentDidMount(){
        this.getRandomKey();
    }
    //获取随机key
    getRandomKey = ()=>{
        api.randomkey()
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    this.setState({
                        randKey: data.data
                    })
                }
            })
            .catch(error=>{
                setTimeout(()=>{
                    this.getRandomKey();
                }, 1000);
            })
    };
    beforeUpload = (e)=>{
        if (e.name.indexOf(this.state.randKey) === -1){
            message.warning('文件名必须与随机key一致!');
            return false;
        }
        this.setState({
            fileList: [e]
        })
    };
    onRemove = (e)=>{
        this.setState({
            fileList: []
        })
    };
    onFinish = (values)=>{
        if (!this.state.randKey){
            message.warning('网络错误！请稍后重试');
            return;
        }
        if (this.state.fileList.length === 0){
            message.warning('请上传文件');
            return;
        }
        const data = {...values, micorkey: this.state.randKey, uploader: this.admin.count};
        api.savemicor(JSON.stringify(data))
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    this.props.handleOk && this.props.handleOk();
                    message.success('添加成功!');
                }
                else {
                    message.warning('添加失败!');
                }
            })
            .catch(error=>{
                message.warning('添加失败!');
            });
    };
    render() {
        const layout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        };
        const tailLayout = {
            wrapperCol: { offset: 4, span: 20 },
        };
        return (
            <Form
                {...layout}
                onFinish={this.onFinish}
                ref={this.formRef}
            >
                <Form.Item
                    label="随机key："
                >
                    <span>{this.state.randKey}</span>
                </Form.Item>
                <Form.Item
                    label="组件名称："
                    name="micorname"
                    rules={[{ required: true, message: '请输入组件名称!' }]}
                >
                    <Input maxLength={10} placeholder="请输入组件名称"/>
                </Form.Item>
                <Form.Item
                    label="组件描述："
                    name="micordis"
                    rules={[{ required: true, message: '请输入组件描述!' }]}
                >
                    <TextArea rows={2} placeholder="请输入组件描述"/>
                </Form.Item>
                <Form.Item
                    label="组件文件："
                >
                    <Upload
                        name="micor"
                        action="/admin/micorapp"
                        fileList={this.state.fileList}
                        beforeUpload={this.beforeUpload}
                        onRemove={this.onRemove}
                        accept='.zip'
                    >
                        <Button icon={<UploadOutlined />}>上传微应用</Button> (支持.zip格式)
                    </Upload>
                </Form.Item>
                <Form.Item
                    label="可见性："
                    name="looker"
                >
                    <Input placeholder="不输入则任意用户可搜索;base归为基本组件;输入指定用户"/>
                </Form.Item>
                <Form.Item {...tailLayout}>
                    <Button type="primary" htmlType="submit">
                        提交
                    </Button>
                </Form.Item>
            </Form>
        );
    }
}