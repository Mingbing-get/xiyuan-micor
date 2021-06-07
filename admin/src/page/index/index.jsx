import React from 'react';
import './index.css';

import { Layout, Menu, Typography, Avatar, Button, Modal } from 'antd';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined,
    SnippetsOutlined,
    MessageOutlined,
    NotificationOutlined,
    RollbackOutlined,
    UserAddOutlined,
    BarChartOutlined,
    ToolOutlined,
    EllipsisOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';

import api from '../../http/api.js';

import RouterIndex from './router.js';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export default class Index extends React.Component {
    constructor(props) {
        super(props);
        this.admin = JSON.parse(sessionStorage.getItem('admin')) || {};
        this.state = {
            collapsed: false,
            selectKeys:['/index/article']
        };
    }

    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };
    logout = ()=>{
        Modal.confirm({
            title: '退出确认?',
            icon: <ExclamationCircleOutlined />,
            content: '确认退出嘻苑后台管理系统',
            onOk:()=> {
                api.logout()
                    .then(res=>res.json())
                    .then(data=>{
                        sessionStorage.removeItem('admin');
                        this.props.history.push('/login');
                    })
                    .catch(error=>{
                        sessionStorage.removeItem('admin');
                        this.props.history.push('/login');
                    });
            },
            cancelText:'取消',
            okText:'确认',
        });
    };
    shouldComponentUpdate(newprops){
        if (newprops.location.pathname !== this.state.selectKeys[0]){
            this.setState({
                selectKeys:[newprops.location.pathname]
            });
            return false;
        }
        return true;
    }
    menuClick = (e)=>{
        this.props.history.push(e.key);
    };
    toinfo = ()=>{
        this.props.history.push('/index/adminInfo');
    };
    render() {
        return (
            this.admin && this.admin.status !== '禁止'?
            <Layout className='index-box'>
                <Sider trigger={null} collapsible collapsed={this.state.collapsed}>
                    {
                        this.state.collapsed?
                            <div className="index-admin-box" >
                                <EllipsisOutlined/>
                            </div>:
                            <div className="index-admin-box" >
                                <Title level={4}>{this.admin.name}(L<sub>{this.admin.level}</sub>)</Title>
                                <Avatar
                                    size={100}
                                    icon={<UserOutlined />}
                                    src={this.admin.touxiang}
                                    onClick={this.toinfo}
                                    style={{cursor:'pointer'}}
                                />
                                <Button
                                    type='danger'
                                    style={{marginTop:10}}
                                    onClick={this.logout}
                                >退出登录</Button>
                            </div>
                    }
                    <Menu
                        theme="dark"
                        mode="inline"
                        selectedKeys={this.state.selectKeys}
                        onClick={this.menuClick}
                    >
                        <Menu.Item key="/index/article" icon={<SnippetsOutlined />}>
                            文章管理
                        </Menu.Item>
                        <Menu.Item key="/index/agument" icon={<MessageOutlined />}>
                            评论管理
                        </Menu.Item>
                        <Menu.Item key="/index/statistic" icon={<BarChartOutlined />}>
                            统计
                        </Menu.Item>
                        <Menu.Item key="/index/micorapp" icon={<ToolOutlined />}>
                            微应用
                        </Menu.Item>
                        <Menu.Item key="/index/notify" icon={<NotificationOutlined />}>
                            通知
                        </Menu.Item>
                        <Menu.Item key="/index/feedback" icon={<RollbackOutlined />}>
                            反馈
                        </Menu.Item>
                        {
                            this.admin.level===1 &&
                            <Menu.Item key="/index/adminusers" icon={<UserAddOutlined />}>
                                管理员管理
                            </Menu.Item>
                        }
                    </Menu>
                </Sider>
                <Layout className="site-layout">
                    <Header className="site-layout-background" style={{ padding: 0 }}>
                        {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                            className: 'trigger',
                            onClick: this.toggle,
                        })}
                    </Header>
                    <Content
                        className="site-layout-background"
                    >
                       <RouterIndex/>
                    </Content>
                </Layout>
            </Layout>
                :
                <div>
                    该管理员已经被禁止使用了
                </div>
        );
    }
}
