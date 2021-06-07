import React from 'react';
import './index.css';
import NavBar from '../../components/navbar';
import Strip from '../../components/strip';
import {Modal, message, Input, Radio, DatePicker, Button} from 'antd';
import 'moment/locale/zh-cn';
import moment from 'moment';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import { LeftOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

import api from '../../http/api.js';

import { connect } from 'react-redux';
import { logout, login } from '../../redux/action/login.js';
import { delSocket } from '../../redux/action/socket.js';
import { delNoread } from '../../redux/action/noread.js'

class UpdateMine extends React.Component {
    constructor(){
        super();
        this.state={
            user:null,
            nickName:'',
            nickNameVisible:false,
            tel:'',
            telVisible:false,
            email:'',
            emailVisible:false,
            sex:'',
            sexVisible:false,
            birthday:null,
            birthdayVisible:false,
            logoutVisible:false
        };
    };

    componentDidMount(){
        if (this.props.user.login){
            this.setState({
                user:this.props.user
            });
            return;
        }
        if (localStorage.getItem('user')){
            this.setState({
                user:{login:true, ...JSON.parse(localStorage.getItem('user'))}
            });
            return;
        }
        this.props.history.replace('/login');
    };

    //关闭所有的model
    closeModel = ()=> {
        this.setState({
            nickNameVisible:false,
            sexVisible:false,
            birthdayVisible:false,
            telVisible:false,
            emailVisible:false,
            logoutVisible:false
        });
    };
    //点击修改昵称
    nicknameClick = (e)=>{
        this.setState({
            nickName:this.state.user.name,
            nickNameVisible:true
        });
    };
    //确认修改昵称
    confirmNickName = (e)=>{
        if (this.state.nickName.length === 0){
            message.destroy();
            message.error('昵称不能为空');
            return true;
        }
        if (this.state.nickName.length > 7){
            message.destroy();
            message.error('昵称不能超过7位');
            return true;
        }
        this.setState({
            user:{...this.state.user, name:this.state.nickName},
            nickNameVisible:false
        });
    };

    //点击修改电话
    telClick = (e)=>{
        this.setState({
            tel:this.state.user.tel,
            telVisible:true
        });
    };
    //确认修改电话
    confirmTel = (e)=>{
        if (!/^1(3|4|5|6|7|8|9)[0123456789]{9}$/.test(this.state.tel)){
            message.destroy();
            message.warning('请输入正确的电话号码!');
            return;
        }
        this.setState({
            user:{...this.state.user, tel:this.state.tel},
            telVisible:false
        });
    };

    //点击修改邮箱
    emailClick = (e)=>{
        this.setState({
            email:this.state.user.email,
            emailVisible:true
        });
    };
    //确认修改邮箱
    confirmEmail = (e)=>{
        if (!/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(this.state.email)){
            message.destroy();
            message.warning('请输入正确的邮箱!');
            return;
        }
        this.setState({
            user:{...this.state.user, email:this.state.email},
            emailVisible:false
        });
    };

    //点击修改性别
    sexClick = (e)=>{
        this.setState({
            sex:this.state.user.sex,
            sexVisible:true
        });
    };
    //确认修改性别
    confirmSex = (e)=>{
        this.setState({
            user:{...this.state.user, sex:this.state.sex},
            sexVisible:false
        });
    };

    //点击修改生日
    birthdayClick = (e)=>{
        this.setState({
            birthday:this.state.user.birthday,
            birthdayVisible:true
        });
    };
    //确认修改生日
    confirmBirthday = (e)=>{
        this.setState({
            user:{...this.state.user, birthday:this.state.birthday},
            birthdayVisible:false
        });
    };

    //点击修改头像
    touxiangClick = (e)=>{
        let tx = e.target.files[0];
        let formdata = new FormData();
        formdata.append('touxiang',tx);
        fetch('/api/touxiang',{
            method:'post',
            body:formdata,
            headers: new Headers({
                "Access-Control-Allow-Origin": "*",
                "User-Token": '',
            }),
            contentType: false,
            processData: false,
        })
            .then((res)=>res.json())
            .then((data)=>{
                if (data.status === 1){
                    data.path = data.path.replace(/\\/g,'/');
                    this.setState({
                        user:{...this.state.user, touxiang:data.path}
                    });
                }
            })
            .catch((error)=>{});
    };

    //点击确认修改
    changeBtnClick = ()=>{
        let data = {};
        for (let key in this.state.user) {
            if (key !== 'login')
                data[key] = this.state.user[key];
        }
        api.updateuser(JSON.stringify(data))
            .then((res)=>res.json())
            .then((rdata)=>{
                if (rdata.status === 1){
                    this.props.login(data);
                    localStorage.setItem('user', JSON.stringify(data));
                    message.destroy();
                    message.success('修改成功!');
                }
                else {
                    message.destroy();
                    message.waring('修改失败!');
                }
            })
            .catch((error)=>{
                message.destroy();
                message.waring('修改失败!');
            });
    };

    //点击退出登录
    logoutClick = ()=>{
        Modal.confirm({
            title: '退出提示',
            icon: <ExclamationCircleOutlined />,
            content: '确认退出当前账号?',
            onOk:this.logoutConfirm,
            okText: '确认',
            cancelText: '取消',
        });
    };
    //点击修改密码
    toUpdatePassword = ()=>{
        this.props.history.push('/updatepassword');
    };
    //确认退出
    logoutConfirm = ()=>{
        api.logout()
            .then((res)=>res.json())
            .then((data)=>{
                if (data.status === 1){
                    //退出成功，清理本地登录信息
                    localStorage.removeItem('user');
                    //通知服务器，退出登录
                    this.props.socket.emit('logout', this.props.user.count);
                    this.props.logout();
                    this.props.delSocket();
                    this.props.delNoread();
                    this.props.history.push('/mine');
                    message.destroy();
                    message.success('退出成功!');
                }
                else {
                    message.destroy();
                    message.warning('操作失败!');
                }
            })
            .catch((error)=>{
                message.destroy();
                message.warning('操作失败!');
            });
    };

    render(){
        return(
            <div className='updatemine-box'>
                <NavBar
                    leftContent={<LeftOutlined onClick={() => {this.props.history.goBack();}}/>}
                >我的资料</NavBar>
                <div className='touxiang-box'>
                    <label htmlFor='touxiang'>
                        <Strip
                            right={
                                this.state.user&&
                                <div className='update-img' style={{backgroundImage:'url('+this.state.user.touxiang+')'}}></div>
                            }
                        >
                            我的头像
                        </Strip>
                    </label>
                    <input type='file' id='touxiang' accept='image/*' onChange={(e)=>{this.touxiangClick(e)}}/>
                </div>
                <Strip
                    right={
                        this.state.user&&
                        <div>{this.state.user.count}</div>
                    }
                    rightarrow={true}
                >
                    我的账号
                </Strip>
                <Strip
                    right={
                        this.state.user&&
                        <div>{this.state.user.name}</div>
                    }
                    onClick={(e)=>{this.nicknameClick(e)}}
                >
                    我的昵称
                </Strip>
                <Strip
                    right={
                        this.state.user&&
                        <div>{this.state.user.tel}</div>
                    }
                    onClick={(e)=>{this.telClick(e)}}
                >
                    我的电话
                </Strip>
                <Strip
                    right={
                        this.state.user&&
                        <div>{this.state.user.email}</div>
                    }
                    onClick={(e)=>{this.emailClick(e)}}
                >
                    我的邮箱
                </Strip>
                <Strip
                    right={
                        this.state.user&&
                        <div>{this.state.user.sex}</div>
                    }
                    onClick={(e)=>{this.sexClick(e)}}
                >
                    我的性别
                </Strip>
                <Strip
                    right={
                        this.state.user&&
                        <div>{new Date(this.state.user.birthday).format('yyyy-MM-dd')}</div>
                    }
                    onClick={(e)=>{this.birthdayClick(e)}}
                >
                    我的生日
                </Strip>
                <div className='update-btn-box'>
                    <Button type='primary' block onClick={this.changeBtnClick}>确认修改</Button>
                    <Button
                        type='primary'
                        block
                        onClick={this.toUpdatePassword}
                        style={{backgroundColor:'orange',borderColor:'orange'}}
                    >修改密码</Button>
                    <Button type='danger' block onClick={this.logoutClick}>退出登录</Button>
                </div>
                <Modal
                    title="修改昵称"
                    visible={this.state.nickNameVisible}
                    onOk={this.confirmNickName}
                    onCancel={this.closeModel}
                    okText='确定'
                    cancelText='取消'
                >
                    <Input
                        value={this.state.nickName}
                        onChange={(e)=>{this.setState({nickName:e.target.value})}}
                        palceholder='请输入昵称'
                    />
                </Modal>
                <Modal
                    title="修改电话"
                    visible={this.state.telVisible}
                    onOk={this.confirmTel}
                    onCancel={this.closeModel}
                    okText='确定'
                    cancelText='取消'
                >
                    <Input
                        value={this.state.tel}
                        onChange={(e)=>{this.setState({tel:e.target.value})}}
                        palceholder='请输入昵称'
                    />
                </Modal>
                <Modal
                    title="修改邮箱"
                    visible={this.state.emailVisible}
                    onOk={this.confirmEmail}
                    onCancel={this.closeModel}
                    okText='确定'
                    cancelText='取消'
                >
                    <Input
                        value={this.state.email}
                        onChange={(e)=>{this.setState({email:e.target.value})}}
                        palceholder='请输入昵称'
                    />
                </Modal>
                <Modal
                    title="修改性别"
                    visible={this.state.sexVisible}
                    onOk={this.confirmSex}
                    onCancel={this.closeModel}
                    okText='确定'
                    cancelText='取消'
                >
                    <Radio.Group
                        onChange={(e)=>{this.setState({sex:e.target.value})}}
                        value={this.state.sex}>
                        <Radio value='男'>男</Radio>
                        <Radio value='女'>女</Radio>
                    </Radio.Group>
                </Modal>
                <Modal
                    title="修改生日"
                    visible={this.state.birthdayVisible}
                    onOk={this.confirmBirthday}
                    onCancel={this.closeModel}
                    okText='确定'
                    cancelText='取消'
                >
                    <DatePicker
                        locale={locale}
                        placeholder='请选择生日'
                        value={moment(this.state.birthday, 'YYYY-MM-DD')}
                        onChange={(e)=>{this.setState({birthday:e._d.format('yyyy-MM-dd')})}}
                        format='YYYY-MM-DD'
                    />
                </Modal>
            </div>
        );
    };
}

const mapStoreToProps = (store)=>{
    return {
        user:store.loginReducer,
        socket:store.socketReducer,
        noread:store.noreadReaducer
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        logout:()=>{ dispatch(logout()) },
        login:(user)=>{ dispatch(login(user)) },
        delSocket:()=>{ dispatch(delSocket()) },
        delNoread:()=>{ dispatch(delNoread()) },
    }
};

UpdateMine = connect(mapStoreToProps, mapDispatchToProps)(UpdateMine);

export default UpdateMine;