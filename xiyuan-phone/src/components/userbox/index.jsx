import React from 'react';
import './index.css';

import {Avatar} from "antd";
import { ManOutlined, WomanOutlined } from '@ant-design/icons';

export default class Userbox extends React.Component {
    touserClick = (count)=>{
        if (this.props.history.location.pathname.startsWith('/action')){
            this.props.history.push('/empty');
            setTimeout(()=>{
                this.props.history.push('/action/'+count);
            });
        }
        else
            this.props.history.push('/action/'+count);
    };
    render() {
        const value = this.props.data;
        return (
            <div className='follow-box'>
                <Avatar
                    src={value.userInfo.touxiang}
                    size={50}
                    style={{cursor:'pointer'}}
                    onClick={()=>{this.touserClick(value.userInfo.count)}}
                />
                <div className='follow-info'>
                    <p>
                        {value.userInfo.name}
                        {value.userInfo.sex==='男'?
                            <ManOutlined style={{color:'#3194d0'}}/>
                            :
                            <WomanOutlined style={{color:'#ea6f5a'}}/>}
                    </p>
                    <div>
                        <span>文章 {value.pageCount}</span>
                        <span>关注 {value.followCount}</span>
                        <span>评论 {value.agumentCount}</span>
                    </div>
                    <p>发表的 {value.pageCount} 篇文章，共收获 {value.likeCount} 个喜欢</p>
                </div>
            </div>
        );
    }
}