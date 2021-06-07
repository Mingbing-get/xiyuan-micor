import React from 'react';
import './index.css';

import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

export default class Info extends React.Component {
    render(){
        return(
            <div
                className='info-box'
                onClick={this.props.infoClick?(e)=>{this.props.infoClick(e)}:null}
            >
                <Avatar size='large' icon={<UserOutlined />} src={this.props.user.touxiang}/>
                <div className='info-right'>
                    {this.props.user.name}
                </div>
            </div>
        );
    };
}