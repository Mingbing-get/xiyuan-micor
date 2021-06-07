import React from 'react';
import './index.css';
//引入配置
import { LOGO } from '../../config.js';
//使用router
import {HashRouter as Router} from 'react-router-dom';
import Routers from '../../routers.jsx';
//引入自定义组件
import Top from './top';
import Aside from './aside';
//引入redux
import { connect } from 'react-redux';
import { logout } from '../../redux/action/login.js';
import { showlogin, closelogin } from '../../redux/action/showlogin.js';
import { delSocket } from '../../redux/action/socket.js'
import { delNoread } from '../../redux/action/noread.js'
//引入antd的组件
import { Layout } from 'antd';
const { Header, Content } = Layout;

class Index extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            ismine:false
        }
    };
    setMine = (ismine)=>{
        this.setState({
            ismine
        });
    };
    render(){
        return(
            <div>
                <Router>
                    <Layout>
                        <Header style={{ position: 'fixed', zIndex: 110, width: '100%' }}>
                            <div className="logo" style={{backgroundImage:'url('+LOGO+')'}}/>
                            <Top
                                user={this.props.user}
                                logout={this.props.logout}
                                isshowlogin={this.props.isshowlogin}
                                showlogin={this.props.showlogin}
                                closelogin={this.props.closelogin}
                                setMine={this.setMine}
                                noread={this.props.noread}
                                delNoread={this.props.delNoread}
                                delSocket={this.props.delSocket}
                                socket={this.props.socket}
                            />
                        </Header>
                        <Content className="site-layout" style={{ padding: '0 50px', marginTop: 64 }}>
                            <Layout className="site-layout-background" style={{ padding: '12px 0' }}>
                                {
                                    this.state.ismine
                                    &&
                                    <Aside
                                        noread={this.props.noread}
                                    />
                                }
                                <Content style={{ padding: '0 12px', minHeight: 50 }}>
                                    <Routers></Routers>
                                </Content>
                            </Layout>
                        </Content>
                    </Layout>
                </Router>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.loginReducer,
        isshowlogin: state.showloginReducer,
        noread: state.noreadReaducer,
        socket: state.socketReducer,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        logout:()=>{ dispatch(logout()) },
        showlogin:()=>{ dispatch(showlogin()) },
        closelogin:()=>{ dispatch(closelogin()) },
        delSocket:()=>{ dispatch(delSocket()) },
        delNoread:()=>{ dispatch(delNoread()) },
    }
};

Index = connect(mapStateToProps, mapDispatchToProps)(Index);

export default Index;