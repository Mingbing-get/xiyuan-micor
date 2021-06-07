import React from 'react';
import './index.css';

import NavBar from '../../components/navbar';
import Loading from '../../components/loading';
import { LeftOutlined } from '@ant-design/icons';
import api from '../../http/api';

export default class Publish extends React.Component {
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
        api.querypublish(this.user.count)
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    let dataTemp = [];
                    let dataObj = {};
                    data.data.forEach(value=>{
                        if (!dataObj[value.url]){
                            dataObj[value.url] = [];
                            dataTemp.push(dataObj[value.url]);
                        }
                        dataObj[value.url].push(value);
                    });
                    this.setState({
                        data:dataTemp,
                        initing:false
                    });
                }
            })
            .catch(error=>{})
    }
    componentWillUnmount(){
        // 卸载异步操作设置状态
        this.setState = (state, callback) => {
            return;
        }
    }
    render(){
        return(
            <div className='publish-box'>
                <NavBar
                    leftContent={<LeftOutlined onClick={() => {this.props.history.goBack();}}/>}
                >我的文章</NavBar>
                {
                    this.state.initing?
                        <Loading/>
                        :
                        this.state.data.map((value,index)=>{
                            return (
                                <div key={index} className='publish-one-box'>
                                    <p>访问地址：
                                        <a href={'#/showpage/'+this.user.count+'/'+value[0].url+'/'+value[0].version}>
                                            {'/showpage/'+this.user.count+'/'+value[0].url}
                                        </a>
                                    </p>
                                    {
                                        value.map(value=>{
                                            return(
                                                <div key={value.id} className='show-all' onClick={()=>{this.showPageClick(value.id)}}>
                                                    <div className='content'>
                                                        <h5>标题：{value.title}</h5>
                                                        <p>版本：{value.version}</p>
                                                        <p>发表时间：{new Date(value.time).format('yyyy/MM/dd hh:mm:ss')}</p>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            )
                        })
                }
            </div>
        );
    }
}