import React from 'react';
import './index.css';

import api from '../../../../http/api.js';
import Articlebox from '../../../../components/articlebox';
import Loading from '../../../../components/loading';

import { Avatar, Pagination } from 'antd';

export default class Agument extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data:[],
            current:1,
            initing:true
        }
    }
    componentDidMount(){
        this.getData(1);
    }
    componentWillUnmount(){
        // 卸载异步操作设置状态
        this.setState = (state, callback) => {
            return;
        }
    }
    pageChange = (e)=>{
        this.getData(e);
    };
    getData = (page)=>{
        api.queryuagument(this.props.count, page)
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    this.setState({
                        data:data.data,
                        current:page,
                        initing:false
                    });
                }
            })
            .catch(error=>{});
    };
    render(){
        return(
            this.state.initing?
                <Loading/>
                :
                <div>
                    {
                        this.state.data.map(value=>{
                            return (
                                <div key={value.id} className='agument-box'>
                                    <Avatar src={value.touxiang} size={25}/>
                                    <span>{value.name}</span>
                                    <span className='time-box'>发表了评论：{new Date(value.time).format('yyyy/MM/dd hh:mm:ss')}</span>
                                    <p>{value.content}</p>
                                    <Articlebox
                                        data={value.pageInfo}
                                        style={{paddingTop:0, paddingLeft:'20px', borderLeft:'5px solid #ddd'}}
                                        gray={true}
                                        history={this.props.history}
                                    />
                                </div>
                            )
                        })
                    }
                    <Pagination
                        current={this.state.current}
                        onChange={this.pageChange}
                        hideOnSinglePage={true}
                        showSizeChanger={false}
                        defaultPageSize={6}
                        total={this.props.total}
                        style={{marginTop:20, textAlign:'center'}}
                    />
                </div>
        )
    }
}