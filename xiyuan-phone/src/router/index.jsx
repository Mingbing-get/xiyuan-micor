import React from 'react';
import { NavLink } from 'react-router-dom';
import './index.css';

import { Badge } from 'antd';
import { HomeOutlined, MessageOutlined, LikeOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';

import { connect } from 'react-redux';

class Router extends React.Component{
    render(){
        return (
            <div className='router-box'>
                <NavLink exact={true} to='./'>
                    <HomeOutlined/>
                    首页
                </NavLink>
                <NavLink exact={true} to='./message'>
                    <Badge
                        size='small'
                        count={this.props.noread>0?this.props.noread:0}
                        offset={[-15,4]}
                    >
                        <MessageOutlined/>
                    </Badge>
                    消息
                </NavLink>
                <NavLink exact={true} to='./liketop'>
                    <LikeOutlined/>
                    点赞榜
                </NavLink>
                <NavLink exact={true} to='./followtop'>
                    <PlusOutlined/>
                    关注榜
                </NavLink>
                <NavLink exact={true} to='./mine'>
                    <UserOutlined/>
                    我的
                </NavLink>
            </div>
        );
    };
}

const mapStateToProps = (state) => {
    return {
        noread: state.noreadReaducer,
    }
};

Router = connect(mapStateToProps)(Router);

export default Router;