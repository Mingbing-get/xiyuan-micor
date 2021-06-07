import React from 'react';
import './index.css';

import api from '../../../http/api';
import base from '../../../http/base';

import {Collapse, Button, Modal, message, Select} from 'antd';
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined  } from '@ant-design/icons';

import Loading from '../../../components/loading';

const { Panel } = Collapse;
const { confirm } = Modal;
const { Option } = Select;

export default class Publish extends React.Component {
    constructor(props){
        super(props);
        this.user = JSON.parse(localStorage.getItem('user'));
        this.state={
            data:null,
            initing:true
        }
    }
    componentDidMount(){
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
    showDeleteConfirm = (e, index, id)=>{
        e.stopPropagation();
        confirm({
            title: '删除提示',
            icon: <ExclamationCircleOutlined />,
            content: '确认删除该文章?',
            okText: '删除',
            okType: 'danger',
            cancelText: '取消',
            onOk : ()=> {
                api.deletepage(id)
                    .then(res=>res.json())
                    .then(data=>{
                        if (data.status === 1){
                            if (this.state.data[index].length === 1){
                                this.setState({
                                    data:[...this.state.data.slice(0,index), ...this.state.data.slice(index+1)]
                                });
                            }
                            else {
                                let delData = this.state.data[index].filter(value=>{
                                    return value.id !== id;
                                });
                                this.setState({
                                    data:[...this.state.data.slice(0,index), delData, ...this.state.data.slice(index+1)]
                                });
                            }
                            message.destroy();
                            message.success('删除成功!');
                        }
                        else {
                            message.destroy();
                            message.warning('删除失败!');
                        }
                    })
                    .catch(error=>{
                        message.destroy();
                        message.warning('删除失败!');
                    });
            },
        });
    };
    updateClick = (e, id)=>{
        e.stopPropagation();
        api.updatepublish(id)
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    this.props.history.push('/mine/newpage/'+data.id);
                }
                else {
                    message.destroy();
                    message.warning('新建编辑失败!');
                }
            })
            .catch(error=>{
                message.destroy();
                message.warning('新建编辑失败!');
            });
    };
    showPageClick = (usercount,url,version)=>{
        this.props.history.push('/showpage/'+usercount+'/'+url+'/'+version);
    };
    changeLookuser = (e,id)=>{
        api.updatelookuser(e,id)
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    message.destroy();
                    message.success('修改成功!');
                }
                else {
                    message.destroy();
                    message.warning('修改失败!');
                }
            })
            .catch(error=>{
                message.destroy();
                message.warning('修改失败!');
            });
    };
    render(){
        return(
            this.state.initing?
                <Loading/>
                :
                <div>
                    <Collapse>
                        {
                            this.state.data && this.state.data.map((value,index)=>{
                                return (
                                    <Panel key={index} header={'访问地址：'+base.baseUrl+'/showpage/'+this.user.count+'/'+value[0].url}>
                                        {
                                            value.map(value=>{
                                                return(
                                                    <div key={value.id} className='show-all' onClick={()=>{this.showPageClick(value.usercount,value.url,value.version)}}>
                                                        <div className='content'>
                                                            <p>标题：{value.title}</p>
                                                            <p>版本：{value.version}</p>
                                                            <p>发表时间：{new Date(value.time).format('yyyy/MM/dd hh:mm:ss')}</p>
                                                        </div>
                                                        <div>
                                                            <Button
                                                                type="primary"
                                                                danger icon={<DeleteOutlined/>}
                                                                size='small'
                                                                onClick={(e)=>{this.showDeleteConfirm(e,index,value.id)}}
                                                            >
                                                                删除
                                                            </Button>
                                                            <Button
                                                                type="primary"
                                                                icon={<EditOutlined/>}
                                                                size='small'
                                                                onClick={(e)=>{this.updateClick(e,value.id)}}
                                                            >
                                                                编辑
                                                            </Button>
                                                            <Select
                                                                size='small'
                                                                onClick={(e)=>{e.stopPropagation();}}
                                                                defaultValue={value.lookuser}
                                                                onChange={(e)=>{this.changeLookuser(e, value.id)}}
                                                            >
                                                                <Option value="all">所有人</Option>
                                                                <Option value="online">登录可见</Option>
                                                                <Option value="onlyme">仅自己</Option>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </Panel>
                                )
                            })
                        }
                    </Collapse>
                </div>
        );
    }
}