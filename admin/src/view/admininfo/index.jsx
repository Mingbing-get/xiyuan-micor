import React from 'react';
import './index.css';
import { Form, Input, Button, Radio, Upload, message, Modal } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'

import api from '../../http/api.js';
import Updatepassword from "./updatepassword";

export default class AdminInfo extends React.Component {
    constructor(props){
        super(props);
        this.formRef = React.createRef();
        this.admin = JSON.parse(sessionStorage.getItem('admin')) || {};
        this.state = {
            loading: false,
            imageUrl:null,
            user:{}
        };
    }

    componentDidMount(){
        this.setState({
            imageUrl:this.admin.touxiang,
            user:{...this.admin}
        });
    };

    onFinish = (values)=>{
        let userData = {
            count:this.admin.count,
            touxiang:this.state.imageUrl
        };
        for (let key in values){
            if (values[key] && key !== 'touxiang'){
                userData[key] = values[key];
            }
        }
        api.updateadmin(JSON.stringify(userData))
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    message.destroy();
                    message.success('修改信息成功!');
                    for (let key in this.admin){
                        if (userData[key]){
                            this.admin[key] = userData[key];
                        }
                    }
                    sessionStorage.setItem('admin', JSON.stringify(this.admin));
                }
                else {
                    message.destroy();
                    message.warning('修改信息失败!');
                }
            })
            .catch(error=>{
                message.destroy();
                message.warning('修改信息失败!');
            });
    };

    //处理头像
    beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('只能选择 JPG/PNG 格式的图片!');
        }
        const isLt2M = file.size / 1024 / 1024 < 20;
        if (!isLt2M) {
            message.error('图片大小不能超过 20MB!');
        }
        return isJpgOrPng && isLt2M;
    };

    handleChange = info => {
        if (info.file.status === 'uploading') {
            this.setState({ loading: true });
            return;
        }
        if (info.file.status === 'done') {
            let path = info.file.response.path;
            path = '/'+path.replace(/\\/g,'/');
            this.setState({
                imageUrl: path,
                loading: false
            })
        }
    };

    //修改密码
    updatepassword = ()=>{
        Modal.info({
            title:"修改密码",
            okText:'关闭',
            width:800,
            content:<Updatepassword/>
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
        const user = this.state.user;
        this.formRef.current && this.formRef.current.setFieldsValue({
            count:user.count,
            name:user.name,
            sex:user.sex,
        });
        const uploadButton = (
            <div>
                {this.state.loading ? <LoadingOutlined /> : <PlusOutlined />}
                <div style={{ marginTop: 8 }}>上传头像</div>
            </div>
        );
        return(
            <div>
                <Form
                    {...layout}
                    onFinish={this.onFinish}
                    ref={this.formRef}
                >
                    <Form.Item
                        label="头像："
                    >
                        <Upload
                            name="touxiang"
                            listType="picture-card"
                            className="avatar-uploader"
                            showUploadList={false}
                            action="/admin/touxiang"
                            beforeUpload={ this.beforeUpload }
                            onChange={ this.handleChange }
                            accept='/image/*'
                        >
                            {
                                this.state.imageUrl ?
                                    <img
                                        src={this.state.imageUrl}
                                        style={{ width: '100%' }}
                                    />
                                    : uploadButton
                            }
                        </Upload>
                    </Form.Item>
                    <Form.Item
                        label="账户："
                        name="count"
                    >
                        <Input disabled/>
                    </Form.Item>

                    <Form.Item
                        label="姓名："
                        name="name"
                        rules={[{ min: 1, message: '请输入姓名!' }]}
                    >
                        <Input maxLength={7}/>
                    </Form.Item>

                    <Form.Item
                        label="性别："
                        name="sex"
                        rules={[{ min: 1, message: '请选择性别!'}]}
                    >
                        <Radio.Group>
                            <Radio value='男'>男</Radio>
                            <Radio value='女'>女</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item {...tailLayout}>
                        <Button type="primary" htmlType="submit">
                            修改
                        </Button>
                        <Button
                            type="primary"
                            onClick={this.updatepassword}
                        >
                            修改密码
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        );
    }
}