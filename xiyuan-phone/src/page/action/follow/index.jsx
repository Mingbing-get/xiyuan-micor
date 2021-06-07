import React from 'react';
import './index.css';

import api from '../../../http/api.js';

import Userbox from '../../../components/userbox';
import Loading from '../../../components/loading';

import { Pagination } from 'antd';

export default class Follow extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            data:[],
            current:1,
            initing:true
        };
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
        api.queryubyfollow(this.props.count, page)
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
                <div className='follow-all-box'>
                    {
                        this.state.data.map(value=>{
                            return (
                                <Userbox data={value} key={value.id} history={this.props.history}/>
                            )
                        })
                    }
                    <Pagination
                        current={this.state.current}
                        onChange={this.pageChange}
                        hideOnSinglePage={true}
                        showSizeChanger={false}
                        defaultPageSize={10}
                        total={this.props.total}
                        style={{marginTop:20, textAlign:'center'}}
                    />
                </div>
        )
    }
}