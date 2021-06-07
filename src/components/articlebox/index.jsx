import React from 'react';
import './index.css';

import { Typography } from 'antd';
import { MessageFilled, LikeFilled } from '@ant-design/icons';

const { Title } = Typography;

export default class Articlebox extends React.Component {
    articleTitleClick = (usercount,url,version)=>{
        this.props.history.push('/showpage/'+usercount+'/'+url+'/'+version);
    };
    render(){
        const value = this.props.data;
        return(
            <div
                className={this.props.gray?'article-box gray':'article-box'}
                style={this.props.style}
            >
                {
                    this.props.gray?
                        <Title level={5} onClick={()=>{this.articleTitleClick(value.usercount,value.url,value.version)}}>{value.title}</Title>
                        :
                        <Title level={4} onClick={()=>{this.articleTitleClick(value.usercount,value.url,value.version)}}>{value.title}</Title>
                }
                <p>{value.discription}</p>
                <div className='show-mun'>
                    {
                        value.name && <span>{value.name}</span>
                    }
                    <span><MessageFilled/> {value.agumentCount}</span>
                    <span><LikeFilled /> {value.likeCount||0}</span>
                    <span>{new Date(value.time).format('yyyy/MM/dd hh:mm:ss')}</span>
                </div>
            </div>
        )
    }
}