import React from 'react';
import './index.css';

import NavBar from '../../components/navbar';
import Loading from '../../components/loading';
import { LeftOutlined } from '@ant-design/icons';
import api from '../../http/api';
import {message} from "antd";

export default class Draft extends React.Component {
    constructor(props){
        super(props);
        this.user = JSON.parse(localStorage.getItem('user'));
        this.state={
            data:[],
            initing:true
        }
    }
    componentDidMount(){
        if (!this.user || !this.user.count){
            this.props.history.replace('/login');
            return;
        }
        api.querydraft(this.user.count)
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    this.setState({
                        data:data.data,
                        initing:false
                    });
                }
                else {
                    message.destroy();
                    message.warning('请求失败!');
                }
            })
            .catch(error=>{
                message.destroy();
                message.warning('请求失败!');
            });
    }
    componentWillUnmount(){
        // 卸载异步操作设置状态
        this.setState = (state, callback) => {
            return;
        }
    }
    render(){
        return(
            <div className='draft-box'>
                <NavBar
                    leftContent={<LeftOutlined onClick={() => {this.props.history.goBack();}}/>}
                >我的草稿</NavBar>
                {
                    this.state.initing?
                        <Loading/>
                        :
                        this.state.data.map(value=>{
                            return (
                                <div className='draft-card' key={value.id}>
                                    <p>地址：{value.url}</p>
                                    <p>版本：{value.version}</p>
                                    <p className='show-one-p'>标题：{value.title}</p>
                                    <p className='show-two-p'>描述：{value.discription}</p>
                                    <p>修改时间：{new Date(value.time).format('yyyy/MM/dd hh:mm:ss')}</p>
                                </div>
                            )
                        })
                }
            </div>
        );
    }
}