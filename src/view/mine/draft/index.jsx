import React from 'react';
import './index.css';

import { message, Card, Button, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined  } from '@ant-design/icons';
import Loading from '../../../components/loading';

import api from '../../../http/api.js';
const { confirm } = Modal;

export default class Draft extends React.Component {
    constructor(props){
        super(props);
        this.user = JSON.parse(localStorage.getItem('user'));
        this.iframe = React.createRef();
        this.resizeFangdou = true;
        this.state = {
            data:null,
            geshu:1,
            initing:true
        }
    }
    componentDidMount(){
        //获取iframe的宽度
        this.computerDiv(this.iframe.current.offsetWidth);
        (this.iframe.current.contentWindow || this.iframe.current).onresize = (e) => {
            if (this.resizeFangdou){
                this.computerDiv(e.target.innerWidth);
                this.resizeFangdou = false;
                setTimeout(()=>{
                    this.resizeFangdou = true;
                },50);
            }
        };

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

    computerDiv = (width)=>{
        let geshu = Math.floor(width/300);
        if (this.state.geshu === geshu)
            return;
        this.setState({
            geshu
        });
    };

    updateClick = (id)=>{
        this.props.history.push('/mine/newpage/'+id);
    };

    showDeleteConfirm = (id)=>{
        confirm({
            title: '删除提示',
            icon: <ExclamationCircleOutlined />,
            content: '确认删除该草稿?',
            okText: '删除',
            okType: 'danger',
            cancelText: '取消',
            onOk : ()=> {
                api.deletepage(id)
                    .then(res=>res.json())
                    .then(data=>{
                        if (data.status === 1){
                            let index = this.state.data.findIndex(value => {
                                return value.id === id;
                            });
                            this.setState({
                                data:[...this.state.data.slice(0,index), ...this.state.data.slice(index+1)]
                            });
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
    render(){
        const yushu = this.state.data && this.state.data.length%this.state.geshu;
        return(
            <div className='draft-box'>
                <iframe ref={this.iframe}></iframe>
                {
                    this.state.initing?
                        <Loading/>
                        :
                        this.state.data && this.state.data.map(value=>{
                            return (
                                <Card className='draft-card' key={value.id}>
                                    <p>地址：{value.url}</p>
                                    <p>版本：{value.version}</p>
                                    <p className='show-one-p'>标题：{value.title}</p>
                                    <p className='show-two-p'>描述：{value.discription}</p>
                                    <p>修改时间：{new Date(value.time).format('yyyy/MM/dd hh:mm:ss')}</p>
                                    <Button
                                        type="primary"
                                        danger icon={<DeleteOutlined/>}
                                        size='small'
                                        onClick={()=>{this.showDeleteConfirm(value.id)}}
                                    >
                                        删除
                                    </Button>
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined/>}
                                        size='small'
                                        onClick={()=>{this.updateClick(value.id)}}
                                    >
                                        编辑
                                    </Button>
                                </Card>
                            )
                        })
                }
                {
                    this.state.data && this.state.data.length>this.state.geshu &&
                    new Array(this.state.geshu-yushu).fill(1).map((value,index) => {
                        return(
                            <div key={index} className='draft-card'></div>
                        )
                    })
                }
            </div>
        );
    }
}