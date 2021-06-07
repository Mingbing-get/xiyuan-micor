import React, { Component } from 'react';
import './index.css';

import api from '../../http/api.js'

import { Card, Input, message } from 'antd';
import Articlebox from '../../components/articlebox';
import Loading from '../../components/loading';

const { Search } = Input;

class Maincontent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loading: false,
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
                        initing: false
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
        if (!e){
            message.destroy();
            message.warning('搜索内容不能为空!');
            return
        }
        this.setState({
            loading:true
        });
        sessionStorage.setItem('serchtextabj', JSON.stringify({text:e}));
        this.props.history.push('/showserch');
    };
    render() {
        return (
            <div>
                <div className='serch-box'>
                    <Search
                        placeholder="请输入关键字"
                        allowClear
                        enterButton="搜索"
                        size="large"
                        onSearch={this.onSearch}
                        loading={this.state.loading}
                    />
                </div>
                {
                    this.state.initing?
                        <Loading/>
                        :
                        <div className='main-box'>
                            {
                                this.state.data.map((value, index)=>{
                                    return (
                                        <Card
                                            title={<span onClick={()=>{this.toSerch(value[0].category)}}>{value[0].category}</span>}
                                            key={index}
                                            hoverable={true}
                                        >
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
                                        </Card>
                                    )
                                })
                            }
                            {
                                this.state.data.length%2===1 &&
                                <div style={{width: '47%', minWidth:'400px'}}></div>
                            }
                        </div>
                }
            </div>
        )
    }
}
export default Maincontent;