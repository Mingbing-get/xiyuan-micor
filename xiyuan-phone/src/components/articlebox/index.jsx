import React from 'react';
import './index.css';

import { MessageFilled, LikeFilled } from '@ant-design/icons';

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
                        <h5 onClick={()=>{this.articleTitleClick(value.usercount,value.url,value.version)}}>{value.title}</h5>
                        :
                        <h5 onClick={()=>{this.articleTitleClick(value.usercount,value.url,value.version)}}>{value.title}</h5>
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