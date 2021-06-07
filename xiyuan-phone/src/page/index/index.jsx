import React from 'react';
import './index.css';

import Router from '../../router';
import { LOGO } from '../../config.js';
import { message, Input } from 'antd';
import api from "../../http/api";
import NavBar from '../../components/navbar';
import Articlebox from "../../components/articlebox";
import Loading from "../../components/loading";
import { SearchOutlined, HeartFilled } from '@ant-design/icons';

export default class Index extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            initing:true
        }
    };

    componentDidMount(){
        api.categorytopfive()
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    let arrdata = [[data.data[0]]];
                    for (let i = 1; i < data.data.length; i++){
                        if (data.data[i].category === data.data[i-1].category){
                            arrdata[arrdata.length-1].push(data.data[i]);
                        }
                        else {
                            arrdata.push([data.data[i]]);
                        }
                    }
                    this.setState({
                        data:data.data.length===0?[]:arrdata,
                        initing:false
                    });
                }
            })
            .catch(error=>{});
    }
    componentWillUnmount(){
        // 卸载异步操作设置状态
        this.setState = (state, callback) => {
            return;
        }
    }
    toSerch = (category)=>{
        sessionStorage.setItem('serchtextabj', JSON.stringify({category}));
        this.props.history.push('/showserch');
    };
    onSearch = (e)=>{
        if (e.keyCode !== 13)
            return;
        if (!e.target.value){
            message.destroy();
            message.warn('搜索内容不能为空!');
            return
        }
        sessionStorage.setItem('serchtextabj', JSON.stringify({text:e.target.value}));
        this.props.history.push('/showserch');
    };
    render() {
        return (
            <div className='index-box'>
                <NavBar
                    leftContent={<img width='60px' src={LOGO}/>}
                >
                    <SearchOutlined/>
                    <Input
                        placeholder='搜索文章'
                        onKeyUp={this.onSearch}
                        bordered={false}
                    />
                </NavBar>
                <div>
                    {
                        this.state.initing?
                            <Loading/>
                            :
                            this.state.data.map((value, index)=>{
                                return (
                                    <div key={index}>
                                        <div className='type-box'>
                                            <HeartFilled/>
                                            <span onClick={()=>{this.toSerch(value[0].category)}}>{value[0].category}</span>
                                            <HeartFilled/>
                                        </div>
                                        {
                                            value.slice(0,5).map(item=>{
                                                return (
                                                    <Articlebox
                                                        key={item.id}
                                                        data={item}
                                                        history={this.props.history}
                                                    />
                                                )
                                            })
                                        }
                                    </div>
                                )
                            })
                    }
                </div>
                <Router/>
            </div>
        );
    }
}