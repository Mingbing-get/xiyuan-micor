import React, {Fragment} from 'react';
import { Menu, Modal, message, Badge } from 'antd';
import { withRouter } from 'react-router-dom';
import Showuser from './showuser';

import Login from '../../login';
import Regist from '../../regist';

import api from '../../../http/api.js';
const { SubMenu } = Menu;

class Top extends React.Component {
    constructor(props){
        super(props);
        this.oldpath = null;
        this.exccept = ['/showpage', '/showserch'];
        this.state = {
            zcvisible:false,
            selectedKeys:''
        }
    }
    componentDidMount(){
        let pathname = this.props.history.location.pathname;
        this.oldpath = pathname;
        if (pathname.indexOf('/mine') !== -1){
            pathname = '/mine';
            this.props.setMine(true);
        }
        this.setState({
            selectedKeys:pathname||'/'
        });
    };
    componentWillReceiveProps(newProps) {
        //解决一些路由只改变参数，页面不会刷新的问题
        let newpath = newProps.history.location.pathname;
        let oldpath = this.oldpath;
        if (oldpath && newpath !== oldpath){
            let matchpath = this.matchStartPath(newpath);
            if (matchpath !== -1 && oldpath.startsWith(matchpath)){
                this.props.history.replace('/empty');
                setTimeout(()=>{
                    this.props.history.replace(newpath);
                });
            }
        }
        this.oldpath = newpath;
        //路由和视图绑定
        if (newpath.startsWith(this.exccept[0]) || newpath.startsWith(this.exccept[1])){
            if (this.state.selectedKeys !== ''){
                this.props.setMine(false);
                this.setState({
                    selectedKeys:''
                });
            }
        }
        else if (newpath.indexOf('/mine') !== -1){
            if (this.state.selectedKeys !== '/mine'){
                this.props.setMine(true);
                this.setState({
                    selectedKeys:'/mine'
                });
            }
        }
        else if (newpath.startsWith('/action')){
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.count===newpath.split('/')[2] && this.state.selectedKeys !== '/mine'){
                this.props.setMine(true);
                this.setState({
                    selectedKeys:'/mine'
                });
            }
            else {
                this.setState({
                    selectedKeys:''
                });
            }
        }
        else {
            if (this.state.selectedKeys !== newpath){
                this.props.setMine(false);
                this.setState({
                    selectedKeys:newpath
                });
            }
        }
        //看socket的变化
        if (!this.props.socket && newProps.socket){
            newProps.socket.on('online',()=>{
                api.logout()
                    .then(res=>res.json())
                    .then(data=>{
                        if (data.status === 1){
                            alert('您的账号在别处登录，被迫下线');
                            this.props.logout();
                            this.props.delSocket();
                            this.props.delNoread();
                            localStorage.removeItem('user');
                            this.props.setMine(false);
                            if (this.state.selectedKeys === '/mine'){
                                this.setState({
                                    selectedKeys:'/'
                                });
                                this.props.history.push('/');
                            }
                        }
                    });
            });
        }
    }
    matchStartPath(pathname){
        const matchArray = ['/action','/mine/newpage','/showpage'];
        let index = matchArray.findIndex(value=>{
            return pathname.startsWith(value);
        });
        if (index === -1)
            return -1;
        return matchArray[index];
    };
    toProgram = (e)=>{
        if (e.keyPath.length === 2 && e.keyPath.includes('user')){
            switch (e.key) {
                case 'logout':
                    this.logout();
                    break;
                case '/persondata':
                    this.personData();
                    break;
                case '/action':
                    this.action();
                    break;
                case '/updatepassword':
                    this.updatePassword();
                    break;
                default:
                    break;
            }
        }
        else {
            if (this.props.history.location.pathname !== e.key){
                this.setState({
                    selectedKeys:e.key,
                });
                this.props.setMine(e.key==='/mine');
                this.props.history.push(e.key==='/mine'?'/mine/publish':e.key);
            }
        }
    };
    subTitleClick = (e)=>{
        if (this.props.user && this.props.user.login)
            return;
        this.props.showlogin();
    };
    zcsubTitleClick = (e)=>{
        this.setState({
            zcvisible:true
        });
    };
    handleOk = ()=>{
        this.props.closelogin();
        this.setState({
            zcvisible:true
        });
    };
    zchandleOk = ()=>{
        this.props.showlogin();
        this.setState({
            zcvisible:false
        });
    };
    handleCancel = ()=>{
        this.props.closelogin();
    };
    zchandleCancel = ()=>{
        this.setState({
            zcvisible:false
        });
    };

    userLogin = ()=>{
        this.handleCancel();
        // this.props.setMine(true);
        // this.setState({
        //     selectedKeys:'/mine'
        // });
    };
    //点击个人的下拉框
    logout = ()=>{
        api.logout()
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    let user = JSON.parse(localStorage.getItem('user'));
                    this.props.socket && this.props.socket.emit('logout',user.count);
                    this.props.logout();
                    this.props.delSocket();
                    this.props.delNoread();
                    localStorage.removeItem('user');
                    this.props.setMine(false);
                    if (this.state.selectedKeys === '/mine'){
                        this.setState({
                            selectedKeys:'/'
                        });
                        this.props.history.push('/');
                    }
                    message.destroy();
                    message.info('成功退出!');
                }
            })
    };
    personData = ()=>{
        this.props.setMine(true);
        this.props.history.push('/mine/persondata');
        this.setState({
            selectedKeys:'/mine',
        });
    };
    action = ()=>{
        this.props.setMine(true);
        this.props.history.push('/action/'+this.props.user.count);
        this.setState({
            selectedKeys:'/mine',
        });
    };
    updatePassword = ()=>{
        this.props.setMine(true);
        this.props.history.push('/mine/updatepassword');
        this.setState({
            selectedKeys:'/mine',
        });
    };
    render(){
        return(
            <div>
                <Menu
                    mode="horizontal"
                    selectedKeys={[this.state.selectedKeys]}
                    onClick={(e)=>{this.toProgram(e)}}
                >
                    <Menu.Item key="/">首页</Menu.Item>
                    <Menu.Item key="/liketop">点赞排行</Menu.Item>
                    <Menu.Item key="/followtop">关注排行</Menu.Item>
                    {
                        this.props.user && this.props.user.login
                        &&
                        <Menu.Item key="/mine">
                            <Badge count={this.props.noread<=0?0:this.props.noread} size="small" offset={[4, -6]}>我的 </Badge>
                        </Menu.Item>
                    }
                    {
                        this.props.user && !this.props.user.login
                        &&
                        <SubMenu
                            key="regist"
                            style={{float:'right'}}
                            title='注册'
                            onTitleClick={(e)=>{this.zcsubTitleClick(e)}}
                        />
                    }
                    <SubMenu
                        key="user"
                        title={<Showuser user={this.props.user}/>}
                        style={{float:'right'}}
                        onTitleClick={(e)=>{this.subTitleClick(e)}}
                    >
                        {
                            this.props.user && this.props.user.login
                            &&
                            <Fragment>
                                <Menu.Item key="/action">我的动态</Menu.Item>
                                <Menu.Item key="/persondata">个人资料</Menu.Item>
                                <Menu.Item key="/updatepassword">修改密码</Menu.Item>
                                <Menu.Item key="logout">退出</Menu.Item>
                            </Fragment>
                        }
                    </SubMenu>
                </Menu>
                <Modal
                    title="用户登录"
                    visible={this.props.isshowlogin}

                    centered={true}

                    onOk={this.handleOk}
                    okText='去注册'

                    onCancel={this.handleCancel}
                    cancelText='取消'
                >
                    <Login closeModel = {this.userLogin}></Login>
                </Modal>
                <Modal
                    title="用户注册"
                    visible={this.state.zcvisible}

                    centered={true}

                    onOk={this.zchandleOk}
                    okText='去登录'

                    onCancel={this.zchandleCancel}
                    cancelText='取消'
                >
                    <Regist zchandleOk={this.zchandleOk}></Regist>
                </Modal>
            </div>
        )
    }
}

export default withRouter(Top);