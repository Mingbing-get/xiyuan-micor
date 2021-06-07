import React from 'react';
import './index.css';
import { Form, Input, Button, Radio, DatePicker, Upload, message } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'

import moment from 'moment';
import 'moment/locale/zh-cn';
import locale from 'antd/lib/date-picker/locale/zh_CN';

import { connect } from 'react-redux';
import { login } from '../../../redux/action/login.js';

import api from '../../../http/api.js';

class Persondata extends React.Component {
    constructor(props){
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            imageUrl:null,
            user:{},
        };
    }

    componentDidMount(){
        let user = this.props.user;
        if (!user.login){
            user = JSON.parse(localStorage.getItem('user'));
            user = user || {};
        }
        this.setState({
            imageUrl:user.touxiang,
            user:user
        });
    };
    componentWillUnmount(){
        // 卸载异步操作设置状态
        this.setState = (state, callback) => {
            return;
        }
    }

    onFinish = (values)=>{
        let userData = {
            count:this.props.user.count,
            touxiang:this.state.imageUrl
        };
        for (let key in values){
            if (values[key] && key !== 'touxiang'){
                if (key === 'birthday')
                    userData.birthday = values.birthday._d.format('yyyy-MM-dd');
                else
                    userData[key] = values[key];
            }
        }
        api.updateuser(JSON.stringify(userData))
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    message.destroy();
                    message.success('修改信息成功!');
                    for (let key in this.props.user){
                        if (!userData[key]){
                            userData[key] = this.props.user[key];
                        }
                    }
                    this.props.login(userData);
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
    onFinishFailed = ()=>{

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
            tel:user.tel,
            email:user.email,
            sex:user.sex,
            birthday:user.birthday?moment(user.birthday, 'YYYY-MM-DD'):null
        });
        const uploadButton = (
            <div>
                {this.state.loading ? <LoadingOutlined /> : <PlusOutlined />}
                <div style={{ marginTop: 8 }}>上传头像</div>
            </div>
        );
        return(
            <Form
                {...layout}
                onFinish={this.onFinish}
                onFinishFailed={this.onFinishFailed}
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
                        action="/api/touxiang"
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
                    label="电话："
                    name="tel"
                    rules={[
                        { min: 1, message: '请输入电话!' },
                        { pattern: /^1(3|4|5|6|7|8|9)[0123456789]{9}$/, message: '请输正确的电话!' }
                    ]}
                >
                    <Input type='tel' maxLength={11}/>
                </Form.Item>

                <Form.Item
                    label="邮箱："
                    name="email"
                    rules={[
                        { min: 1, message: '请输入邮箱!' },
                        { pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/, message: '请输正确的邮箱!' }
                    ]}
                >
                    <Input type='email'/>
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

                <Form.Item {...tailLayout}>
                    <Button type="primary" htmlType="submit">
                        修改
                    </Button>
                </Form.Item>
            </Form>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.loginReducer
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        login:(user)=>{ dispatch(login(user)) }
    }
};

Persondata = connect(mapStateToProps, mapDispatchToProps)(Persondata);
export default Persondata;