import React, { Component } from 'react';
import './index.css';

import api from '../../http/api.js';

import Userbox from '../../components/userbox';
import Loadmore from '../../components/loadmore';
import Router from '../../router';
import NavBar from '../../components/navbar';
import Loading from '../../components/loading';
import { LeftOutlined } from '@ant-design/icons';

class Followtop extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data:[],
            page:1,
            ismore:true,
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
    getData = (page, callback)=>{
        api.followtop(page)
            .then(res=>res.json())
            .then(data=>{
                callback && callback();
                if (data.status === 1){
                    this.setState({
                        data:data.data,
                        page:this.state.page+1,
                        ismore:data.data.length>=10,
                        initing:false
                    });
                }
            })
            .catch(error=>{
                callback && callback();
            });
    };
    loadMore = (callback)=>{
        this.getData(this.state.page, callback);
    };
    render() {
        return (
            <div className='follow-top-box'>
                <NavBar
                    leftContent={<LeftOutlined onClick={() => {this.props.history.goBack();}}/>}
                >关注排行榜</NavBar>
                {
                    this.state.initing?
                        <Loading/>
                        :
                        <React.Fragment>
                            {
                                this.state.data.map((value,index)=>{
                                    return (
                                        <div key={value.byfollowuc} className='follow-top-one'>
                                            <span>{index+1}</span>
                                            <Userbox
                                                data={value}
                                                history={this.props.history}/>
                                        </div>
                                    )
                                })
                            }
                            <Loadmore isMore={this.state.ismore} loadMore={this.loadMore}/>
                        </React.Fragment>
                }
                <Router/>
            </div>
        )
    }
}
export default Followtop;