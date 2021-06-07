import React from 'react';
import './index.css';

import Dragbox from './dragbox';
import Boundary from '../../../components/boundary';
import { Tooltip, Button, Form, Input, Divider, Typography, Select, Collapse, message, Modal } from 'antd';
import { DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';

import Edtbox from './edtbox';
import Showbox from  './showbox';
import DebounceSelect from './debounceSelect';

import { BASEWIDTH } from "../../../config";
import base from '../../../http/base';
import api from '../../../http/api';

const { Title } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { TextArea } = Input;

export default class Newpage extends React.Component {
    constructor(props){
        super(props);
        this.showArea = React.createRef();
        this.resizeFangdou = true;
        this.savetempinterval = null;
        this.user = JSON.parse(localStorage.getItem('user'));
        this.fromRef = React.createRef();
        this.isEditTemp = false;
        this.state = {
            components: [],
            component: {},
            edtArray:[],
            data:[],
            pageConfig:{lookuser: 'all',category:'文章'},
            current:0,
            saveLoading:false,
            publishLoading:false,
            rate:null,
            selectedKey:'scale',
            urlStatus:'',
            pageid:null,
            isEdit:false, //用于标记页面有没有被编辑(修改基本配置，添加、删除组件，修改组件的数据)
            visible:false,
            selectedKeys:[],
            editAreaStyle:{},
            deleteGroupSelected:'',
            serchSelectedValue: [],
            serchModleVisible:false,
            newGroupName:'',
            groupItems:[],
            groupSelected:'',
        }
    };

    componentDidMount(){
        //获取界面的样式
        this.setState({
            editAreaStyle:JSON.parse(localStorage.getItem('editAreaStyle')) || {}
        });
        //获取选择的展示样式
        this.addResizeEvent();
        let selectedKey = localStorage.getItem('selectedKey')||'scale';
        if (selectedKey){
            this.changeRate(selectedKey);
        }
        //获取某个用户需要显示的组件
        this.getMicroapp();
        //判断页面是否有传id过来，若有传则表示是重新编辑页面，若没有传则表示是新页面
        const id = this.props.match.params.id;
        //获取本地缓存和网络缓存，查看该用户是否有没保存的数据，若有则提示是否恢复
        this.haveDontSaveData(()=>{
            if (id){
                this.getPageDataById(id);
            }
        });
        //设置一个定时器，每个一段时间检查一下是否有数据没有保存，若有则自动保存到临时表和本地
        this.savetempinterval = setInterval(this.saveTemp, 10000);
    };
    componentWillUnmount(){
        //该页面卸载的时候，需要去检查是否有数据没有保存，若有则做数据备份(本地和数据库双重备份)
        this.saveTemp();
        clearInterval(this.savetempinterval);
    };

    //获取该用户需要显示到左边的组件
    getMicroapp(){
        this.user && api.showcomponent({
            count: this.user.count
        })
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    this.setState({
                        components: data.data
                    });
                }
            })
            .catch(error=>{});
    }

    //获取本地缓存和网络缓存，查看该用户是否有没保存的数据，若有则提示是否恢复
    haveDontSaveData = (callback)=>{
        let dontSaveData = JSON.parse(localStorage.getItem('dontSaveData')) || [];
        let index = dontSaveData.findIndex(v=>v.usercount===this.user.count);
        api.queryhavetemp(this.user.count)
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    if (!data.data && index === -1){
                        throw new Error('没有未保存的数据');
                    }
                    this.setState({
                        visible:true
                    });
                }
                else {
                    throw new Error('没有未保存的数据');
                }
            })
            .catch(error=>{
                callback();
            });
    };

    //当页面传入一个id时，去获取该id对应的页面的数据
    getPageDataById = (id)=>{
        api.querypage(id)
            .then(res=>res.json())
            .then(async data=>{
                if (data.status === 1){
                    data = data.data;
                    let cpdata = [];
                    let edtArray = [];
                    for (let i = 0; i < data.componentData.length; i++){
                        const value = data.componentData[i];
                        cpdata.push({cpname:value.cpname, cpdata:JSON.parse(value.cpdata.replace(/\n/g,"\\n").replace(/\r/g,"\\r"))});
                        let micorRes = await api.showcomponent({micorkey: value.cpname});
                        micorRes = await micorRes.json();
                        let key = this.randomKey();
                        edtArray.push({key, component:micorRes.data[0]});
                    }
                    this.setState({
                        data:cpdata,
                        edtArray,
                        current:-1,
                        urlStatus:'success',
                        pageid:id,
                        pageConfig:{url:data.url,
                            lookuser: data.lookuser,
                            category:data.category,
                            title:data.title,
                            discription:data.discription}
                    });
                    this.fromRef.current.resetFields();
                }
            })
            .catch(error=>{});
    };

    //检查是否有数据没有保存，若有，则做数据备份(本地和数据库双重备份)
    saveTemp = ()=>{
        if (this.state.isEdit && this.isEditTemp){
            this.isEditTemp = false;
            let data = {
                usercount:this.user.count,
                componentData:JSON.stringify(this.state.data),
                pageConfig:this.state.pageConfig,
                time:(new Date()).format('yyyy-MM-dd hh:mm:ss'),
            };
            if (this.state.pageid){
                data.pageConfig.pageid = this.state.pageid;
            }
            data.pageConfig = JSON.stringify(data.pageConfig);
            //将数据做本地存储
            let dontSaveData = JSON.parse(localStorage.getItem('dontSaveData')) || [];
            let index = dontSaveData.findIndex(v=>v.usercount===this.user.count);
            if (index !== -1){
                dontSaveData[index] = data;
            }
            else
                dontSaveData.push(data);
            localStorage.setItem('dontSaveData', JSON.stringify(dontSaveData));
            //将数据提交到数据库中存储,不验证是否提交成功
            data.componentData = data.componentData.replace(/\"/g,"\\\"").replace(/'/g,"\\'");
            data.pageConfig = data.pageConfig.replace(/\"/g,"\\\"").replace(/'/g,"\\'");
            api.savetemp(JSON.stringify(data));
        }
    };

    //当手动保存数据，或提交数据之后，将自动清空本地的临时保存的数据和数据库中临时保存的数据
    deleteTemp = ()=>{
        let dontSaveData = JSON.parse(localStorage.getItem('dontSaveData')) || [];
        let index = dontSaveData.findIndex(v=>v.usercount===this.user.count);
        if (index !== -1){
            dontSaveData = [...dontSaveData.slice(0,index), ...dontSaveData.slice(index+1)];
            localStorage.setItem('dontSaveData', JSON.stringify(dontSaveData));
        }
        api.deletetemp(this.user.count);
    };

    //给展示框添加监听大小改变的时间
    addResizeEvent = ()=>{
        let showArea = this.showArea.current;
        let iframe = showArea.parentNode.getElementsByTagName('iframe')[0];
        // this.showResize(iframe.offsetWidth);
        (iframe.contentWindow || iframe).onresize = (e) => {
            if (this.state.selectedKey==='scale' && this.resizeFangdou){
                this.showResize(e.target.innerWidth);
                this.resizeFangdou = false;
                setTimeout(()=>{
                    this.resizeFangdou = true;
                },50);
            }
        }
    };
    //展示框大小改变时
    showResize = (width)=>{
        let rate = width/BASEWIDTH;
        rate = Math.floor(rate*100)/100;
        this.setState({
            rate
        });
    };
    //改变缩放比例
    changeRate = (e)=>{
        localStorage.setItem('selectedKey',e);
        if (e === 'scale') {
            let showArea = this.showArea.current;
            let iframe = showArea.parentNode.getElementsByTagName('iframe')[0];
            this.showResize(iframe.offsetWidth);
            this.setState({
                selectedKey:e
            });
            return;
        }
        let rate = null;
        if (e === 'seven')
            rate = 0.75;
        else if (e === 'five')
            rate = 0.5;
        this.setState({
            rate,
            selectedKey:e
        });
    };

    drag = (component)=>{
        //优化，减少render的调用
        if (this.state.component === component){
            return;
        }
        this.setState({
            component
        });
    };
    overDrop = (ev) => {
        ev.preventDefault();
    };
    //当释放鼠标时执行的函数
    drop = (ev) => {
        ev.preventDefault();
        this.isEditTemp = true;

        //随机生成循环的key,保证不能与其他的key相同
        let key = this.randomKey();
        //将新节点添加到节点数组中
        this.setState({
            data:[...this.state.data, {cpname:this.state.component.micorkey}],
            edtArray:[...this.state.edtArray, {key, component:this.state.component}],
            current:this.state.data.length,
            isEdit:true,
            selectedKeys:[...this.state.selectedKeys, key]
        });
    };

    //循环随机生成key
    randomKey(){
        let flag = true;
        let key;
        while(flag) {
            flag = false;
            key = Math.random();
            for (let i = 0; i < this.state.edtArray.length; i++){
                if (key === this.state.edtArray[i].key){
                    flag = true;
                    break;
                }
            }
        }
        return key;
    }

    //用于删除某个组件
    deleteClick = (e, index)=>{
        e.stopPropagation();
        this.isEditTemp = true;
        this.setState({
            data:[...this.state.data.slice(0,index), ...this.state.data.slice(index+1)],
            edtArray:[...this.state.edtArray.slice(0,index), ...this.state.edtArray.slice(index+1)],
            current:this.state.current > index ? this.state.current-1 : this.state.current,
            isEdit:true
        });
    };
    //用于上移某个组件
    arrowUpClick = (e, index)=>{
        e.stopPropagation();
        if (index === 0)
            return;
        this.isEditTemp = true;
        this.setState({
            data:[...this.state.data.slice(0,index-1),this.state.data[index],this.state.data[index-1], ...this.state.data.slice(index+1)],
            edtArray:[...this.state.edtArray.slice(0,index-1),this.state.edtArray[index],this.state.edtArray[index-1], ...this.state.edtArray.slice(index+1)],
            current:index-1,
            isEdit:true
        });
    };
    //用于下移某个组件
    arrowDownClick = (e, index)=>{
        e.stopPropagation();
        if (index === this.state.edtArray.length-1)
            return;
        this.isEditTemp = true;
        this.setState({
            data:[...this.state.data.slice(0,index),this.state.data[index+1],this.state.data[index], ...this.state.data.slice(index+2)],
            edtArray:[...this.state.edtArray.slice(0,index),this.state.edtArray[index+1],this.state.edtArray[index], ...this.state.edtArray.slice(index+2)],
            current:index+1,
            isEdit:true
        });
    };
    //用于子节点修改对应的data
    updateData = (index, data)=>{
        this.isEditTemp = true;
        this.setState({
            data:[...this.state.data.slice(0,index), data, ...this.state.data.slice(index+1)],
            isEdit:true
        });
    };
    //点击某个折叠板
    panelChange = (e)=>{
        this.setState({
            selectedKeys:e
        });
    };
    //选择某个区域
    selectAera = (e, index)=>{
        e.stopPropagation();
        this.setState({
            current:index
        });
    };
    //用于取消选择某个区域
    cancelSelectAera = (e)=>{
        e.stopPropagation();
        this.setState({
            current:-1
        });
    };

    //用于删除样式组
    deletegroup = (e, key)=>{
        e.stopPropagation();
        const selectKeys = ['直接删除', ...this.getOtherGroupName(key)];
        this.setState({
            deleteGroupSelected: '直接删除'
        });
        Modal.confirm({
            title: `确定删除 ${key} 分组`,
            icon: <ExclamationCircleOutlined />,
            content: (
                <div style={{display:'flex', alignItems:'center'}}>
                    <p style={{margin:0}}>内部组件的变动方式：</p>
                    <Select
                        defaultValue='直接删除'
                        onChange={this.deleteGroupChange}
                    >
                        {
                            selectKeys.map((value, index)=>{
                                return (
                                    index === 0 ?
                                        <Option key={index} value={value}>
                                            {value}
                                        </Option>
                                        :
                                        <Option key={index} value={`移动至 ${value}`}>
                                            {`移动至 ${value}`}
                                        </Option>
                                )
                            })
                        }
                    </Select>
                </div>
            ),
            okText:'确定',
            cancelText:'取消',
            onOk: () => {
                const data = {
                    usercount: this.user.count,
                    groupname: key,
                    action: this.state.deleteGroupSelected
                };
                return api.deletemicorgroup(JSON.stringify(data))
                    .then(res=>res.json())
                    .then(data=>{
                        if (data.status === 1){
                            message.success('操作成功!');
                            this.getMicroapp();
                        }
                        else {
                            message.warning('操作失败!');
                        }
                    })
                    .catch(error=>{
                        message.warning('操作失败!');
                    });
            },
        })
    };
    deleteGroupChange = (value)=>{
        this.setState({
            deleteGroupSelected:value
        });
    };
    //用于删除单个样式
    editSigleMicor = (component, groupname) => {
        const selectKeys = ['直接删除', ...this.getOtherGroupName(groupname)];
        this.setState({
            deleteGroupSelected: '直接删除'
        });
        Modal.confirm({
            title: `确定删除 ${component.micorname} 样式`,
            icon: <ExclamationCircleOutlined />,
            content: (
                <div style={{display:'flex', alignItems:'center'}}>
                    <p style={{margin:0}}>删除方式：</p>
                    <Select
                        defaultValue='直接删除'
                        onChange={this.deleteGroupChange}
                    >
                        {
                            selectKeys.map((value, index)=>{
                                return (
                                    index === 0 ?
                                        <Option key={index} value={value}>
                                            {value}
                                        </Option>
                                        :
                                        <Option key={index} value={`移动至 ${value}`}>
                                            {`移动至 ${value}`}
                                        </Option>
                                )
                            })
                        }
                    </Select>
                </div>
            ),
            okText:'确定',
            cancelText:'取消',
            onOk: () => {
                const data = {
                    usercount: this.user.count,
                    groupname: groupname,
                    action: this.state.deleteGroupSelected,
                    micorid: component.id
                };
                return api.deletesiglemicor(JSON.stringify(data))
                    .then(res=>res.json())
                    .then(data=>{
                        if (data.status === 1){
                            message.success('操作成功!');
                            this.getMicroapp();
                        }
                        else {
                            message.warning('操作失败!');
                        }
                    })
                    .catch(error=>{
                        message.warning('操作失败!');
                    });
            },
        })
    };
    //用于搜索样式
    serchStyle = (e)=>{
        e.stopPropagation();
        this.setState({
            serchModleVisible:true,
            groupItems:this.getOtherGroupName('')
        });
    };
    fetchUserList = async (serchText) => {
        if (!serchText) return;
        return api.serchmicor(serchText, this.user.count)
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    //查找已经存在的id(用于过滤)
                    const ids = [];
                    for (let key in this.state.components){
                        if (key === '基础样式') continue;
                        this.state.components[key].forEach(value=>{
                            ids.push(value.id)
                        })
                    }
                    return data.data.map(value=>({
                        label: value.micorname,
                        value: value.id
                    })).filter(item=>{
                        return !ids.includes(item.value)
                    });
                }
                else
                    return [];
            })
            .catch(error=>{})
    };
    onNameChange = event => {
        this.setState({
            newGroupName: event.target.value,
        });
    };
    addItem = () => {
        if (!this.state.newGroupName) return;
        this.setState({
            groupItems: [...this.state.groupItems, this.state.newGroupName],
            newGroupName: '',
        });
    };
    groupSelectChange = (e)=>{
        this.setState({
            groupSelected:e
        });
    };
    serchHandleOk = ()=>{
        const data = {
            usercount:this.user.count,
            groupname:this.state.groupSelected,
            micorid:this.state.serchSelectedValue.map(item=>item.value)
        };
        return api.addmicorgroup(JSON.stringify(data))
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    message.success('添加成功!');
                    this.getMicroapp(); //重新拉取组件数据
                    this.setState({
                        serchModleVisible:false,
                        groupSelected:'',
                        serchSelectedValue:[]
                    })
                }
                else {
                    message.warning('添加失败!')
                }
            })
            .catch(error=>{
                message.warning('添加失败!')
            });
    };
    serchHandleCancel = ()=>{
        this.setState({
            serchModleVisible:false
        })
    };
    //获取该用户除 指定分组样式和基础样式 外的其他分组名称
    getOtherGroupName = (name)=>{
        return Object.keys(this.state.components).filter((value)=>{
            return value !== '基础样式' && value !== name
        })
    };

    //按钮的事件
    saveClick = ()=>{
        let data = this.saveAndPublish();
        if (data === -1)
            return;
        api.savepage(JSON.stringify(data))
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    this.setState({
                        pageid:data.data.id,
                        isEdit:false
                    });
                    this.deleteTemp();
                    message.destroy();
                    message.success('保存成功!');
                }
                else {
                    message.destroy();
                    message.warning('保存失败!');
                }
            })
            .catch(error=>{
                message.destroy();
                message.warning('保存失败!');
            });
    };
    publishClick = ()=>{
        let data = this.saveAndPublish();
        if (data === -1)
            return;
        api.publish(JSON.stringify(data))
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    this.isEditTemp = false;
                    this.deleteTemp();
                    this.props.history.push('/mine/publish');
                    message.destroy();
                    message.success('发表成功!');
                }
                else {
                    message.destroy();
                    message.warning('发表失败!');
                }
            })
            .catch(error=>{
                message.destroy();
                message.warning('发表失败!');
            });
    };
    saveAndPublish = ()=>{
        if (!this.state.pageConfig.url){
            message.destroy();
            message.warning('请输入访问地址!');
            return -1;
        }
        if (this.state.urlStatus !== 'success'){
            message.destroy();
            message.warning('输入的访问地址不可用!');
            return -1;
        }
        let componentData = [];
        let temp = null;
        this.state.data.forEach(value => {
            temp = {...value};
            temp.cpdata = JSON.stringify(temp.cpdata).replace(/\"/g,"\\\"").replace(/'/g,"\\'");
            componentData.push(temp);
        });
        return this.state.pageid===null?{
                componentData,
                usercount:this.user.count,
                time:(new Date()).format('yyyy-MM-dd hh:mm:ss'),
                ...this.state.pageConfig
            }
            :
            {
                componentData,
                time:(new Date()).format('yyyy-MM-dd hh:mm:ss'),
                id:this.state.pageid,
                ...this.state.pageConfig
            };
    };

    //头部的事件
    pageConfigChange = (value, values)=>{
        this.isEditTemp = true;
        this.setState({
            pageConfig:{...values},
            isEdit:true
        });
    };
    //检查输入的地址是否可以用
    availableUrl = (e)=>{
        api.availableurl(this.user.count, e.target.value)
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    this.setState({
                        urlStatus:'success'
                    });
                }
                else {
                    message.destroy();
                    message.warning('该地址不可用!');
                    this.setState({
                        urlStatus:'error'
                    });
                }
            })
            .catch(error=>{
                message.destroy();
                message.warning('该地址不可用!');
                this.setState({
                    urlStatus:'error'
                });
            });
    };

    //界面变化
    boundaryChange = (boundaryStyle, childWidth)=>{
        let editAreaStyle = {boundaryStyle,childWidth};
        localStorage.setItem('editAreaStyle', JSON.stringify(editAreaStyle));
    };

    //弹出的modle的事件
    handleOk = ()=>{
        let dontSaveData = JSON.parse(localStorage.getItem('dontSaveData')) || [];
        let index = dontSaveData.findIndex(v=>v.usercount===this.user.count);
        api.querytemp(this.user.count)
            .then(res=>res.json())
            .then(async data=>{
                if (data.status === 1){
                    data = data.data;//初始化为服务器的数据
                    if (data && index !== -1){
                        //若本地和服务器都有数据，则取时间靠后的为准
                        if (new Date(dontSaveData[index].time)>new Date(data.time))
                            data = dontSaveData[index];
                    }
                    else if (index !== -1){
                        //若只有本地有数据，则取本地的数据
                        data = dontSaveData[index];
                    }
                    //现在计算后的data就是需要恢复的数据
                    data.componentData = JSON.parse(data.componentData.replace(/\n/g,"\\n").replace(/\r/g,"\\r"));
                    data.pageConfig = JSON.parse(data.pageConfig.replace(/\n/g,"\\n").replace(/\r/g,"\\r"));
                    let cpdata = [];
                    let edtArray = [];
                    for (let i = 0; i < data.componentData.length; i++){
                        const value = data.componentData[i];
                        cpdata.push({cpname:value.cpname, cpdata:value.cpdata});
                        let micorRes = await api.showcomponent({micorkey: value.cpname});
                        micorRes = await micorRes.json();
                        let key = this.randomKey();
                        edtArray.push({key, component:micorRes.data[0]});
                    }
                    //如果没有id，但是有url则需要去数据库验证该url是否可用
                    if (!data.pageConfig.pageid && data.pageConfig.url){
                        this.availableUrl({target:{value:data.pageConfig.url}});
                    }
                    this.setState({
                        data:cpdata,
                        edtArray,
                        current:-1,
                        isEdit:true,
                        urlStatus:data.pageConfig.pageid?'success':'',
                        pageid:data.pageConfig.pageid||null,
                        pageConfig:{url:data.pageConfig.url,
                            lookuser: data.pageConfig.lookuser,
                            category:data.pageConfig.category,
                            title:data.pageConfig.title,
                            discription:data.pageConfig.discription}
                    });
                    this.fromRef.current.resetFields();
                }
            })
            .catch(error=>{});
        this.setState({
            visible:false
        });
    };
    handleCancel = ()=>{
        const id = this.props.match.params.id;
        if (id){
            this.getPageDataById(id);
        }
        this.deleteTemp();
        this.setState({
            visible:false
        });
    };

    render(){
        const style = this.state.rate?
            {width:1/this.state.rate*100+'%', height:'', transform: 'scale('+this.state.rate+')'}
            :
            {width:'100%', height:'', transform: 'scale(1)'};
        return(
            <div>
                <Boundary
                    change={this.boundaryChange}
                    boundaryStyle={this.state.editAreaStyle.boundaryStyle}
                >
                    <Boundary.Item span={this.state.editAreaStyle.childWidth?this.state.editAreaStyle.childWidth[0]:20}>
                        <div className='dragBox'>
                            <h3 className='tipTitle'>选择样式</h3>
                            <Collapse
                                ghost
                                defaultActiveKey={[0]}
                            >
                                {
                                    Object.keys(this.state.components).map((key, idx)=>{
                                        return (
                                            <Panel
                                                header={key}
                                                key={idx}
                                                extra={
                                                    key !== '基础样式' &&
                                                    <Tooltip placement="top" title='删除该分组'>
                                                        <DeleteOutlined  className='edt-close' onClick={(e)=>{this.deletegroup(e, key)}}/>
                                                    </Tooltip>}
                                            >
                                                {
                                                    this.state.components[key].map((value, index) => {
                                                        return (
                                                            <Dragbox
                                                                drag={this.drag}
                                                                component={value}
                                                                groupname={key}
                                                                showEdit={this.editSigleMicor}
                                                                key={index}
                                                            >
                                                                {value.micorname}
                                                            </Dragbox>
                                                        );
                                                    })
                                                }
                                            </Panel>
                                        )
                                    })
                                }
                            </Collapse>
                            <Button
                                type='primary'
                                className='serch-btn'
                                onClick={this.serchStyle}
                            >搜索样式</Button>
                        </div>
                    </Boundary.Item>
                    <Boundary.Item span={this.state.editAreaStyle.childWidth&&this.state.editAreaStyle.childWidth[1]}>
                        <div className='centerBox' onClick={this.cancelSelectAera}>
                            <h3 className='tipTitle'>编辑区域</h3>
                            {/*上方的基本配置*/}
                            <Collapse defaultActiveKey={['1']} ghost style={{borderBottom:'1px solid #ddd'}}>
                                <Panel header="文章的基本配置" key="1">
                                    <Form
                                        layout="vertical"
                                        initialValues={this.state.pageConfig}
                                        onValuesChange={this.pageConfigChange}
                                        ref={this.fromRef}
                                    >
                                        <Form.Item
                                            label="访问地址："
                                            name="url"
                                            rules={[
                                                { required: true, message: '请输入文章地址!' },
                                                { pattern: /^[a-zA-Z0-9]{4,23}$/, message: '只能输入字母和数字(4~23)位!' }
                                            ]}
                                            hasFeedback
                                            validateStatus={this.state.urlStatus}
                                        >
                                            <Input
                                                addonBefore={base.baseUrl+"/showpage/"+this.user.count+'/'}
                                                placeholder='文章地址'
                                                onBlur={this.availableUrl}
                                                disabled = {this.state.pageid===null?false:true}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="谁可见："
                                            name="lookuser"
                                        >
                                            <Select>
                                                <Option value="all">所有人</Option>
                                                <Option value="online">登录可见</Option>
                                                <Option value="onlyme">仅自己</Option>
                                            </Select>
                                        </Form.Item>

                                        <Form.Item
                                            label="分类："
                                            name="category"
                                        >
                                            <Select>
                                                <Option value="文章">文章</Option>
                                                <Option value="计算机">计算机</Option>
                                                <Option value="笔记">笔记</Option>
                                                <Option value="数学">数学</Option>
                                                <Option value="分享">分享</Option>
                                            </Select>
                                        </Form.Item>

                                        <Form.Item
                                            label="标题："
                                            name="title"
                                        >
                                            <Input placeholder='文章标题'/>
                                        </Form.Item>

                                        <Form.Item
                                            label="描述："
                                            name="discription"
                                        >
                                            <TextArea rows={4} placeholder='文章的描述'/>
                                        </Form.Item>
                                    </Form>
                                </Panel>
                            </Collapse>
                            {/*中间工作区域*/}
                            <div
                                onDrop={(e)=>{this.drop(e)}}
                                onDragOver={(e)=>{this.overDrop(e)}}
                                className='dropBox'
                            >
                                <Collapse
                                    activeKey={this.state.selectedKeys}
                                    onChange={(e)=>{this.panelChange(e)}}
                                    ghost
                                >
                                    {
                                        this.state.edtArray.map((value, index)=>{
                                            const component = value.component;
                                            return (
                                                <Panel
                                                    header={component.micorname} key={value.key}
                                                    extra={<div className='edt-extra'>
                                                        <Tooltip placement="top" title='上移该部分'>
                                                            <ArrowUpOutlined className={index===0&&'disabled'} onClick={(e)=>{this.arrowUpClick(e, index)}}/>
                                                        </Tooltip>
                                                        <Tooltip placement="top" title='下移该部分'>
                                                            <ArrowDownOutlined className={index===this.state.edtArray.length-1&&'disabled'} onClick={(e)=>{this.arrowDownClick(e, index)}}/>
                                                        </Tooltip>
                                                        <Tooltip placement="top" title='删除该部分'>
                                                            <DeleteOutlined  className='edt-close' onClick={(e)=>{this.deleteClick(e, index)}}/>
                                                        </Tooltip>
                                                    </div>}
                                                    className={this.state.current===index?'active':''}
                                                >
                                                    <Edtbox
                                                        index={index}
                                                        data={this.state.data[index]}
                                                        updateData={this.updateData}
                                                        micorkey={component.micorkey}
                                                    />
                                                </Panel>
                                            )
                                        })
                                    }
                                </Collapse>
                            </div>
                            {/*下方按钮组*/}
                            <div className='drop-btn-box'>
                                <Button
                                    type="primary"
                                    loading={this.state.saveLoading}
                                    onClick={this.saveClick}
                                    style={{marginRight:'10px'}}
                                    disabled={!this.state.isEdit}
                                >
                                    存稿
                                </Button>
                                <Button
                                    type="primary"
                                    loading={this.state.publishLoading}
                                    onClick={this.publishClick}
                                >
                                    发表
                                </Button>
                            </div>
                        </div>
                    </Boundary.Item>
                    <Boundary.Item span={this.state.editAreaStyle.childWidth&&this.state.editAreaStyle.childWidth[2]}>
                        <div className='showBox' onClick={this.cancelSelectAera}>
                            <iframe></iframe>
                            <div className='tipTitle'>
                                <h3>结果预览</h3>
                                <Select
                                    value={this.state.selectedKey}
                                    style={{ width: 90, fontSize:10, marginLeft:20 }}
                                    onChange={this.changeRate}
                                    bordered={false}
                                >
                                    {
                                        this.state.selectedKey==='scale'?
                                            <Option value="scale">{this.state.rate}</Option>
                                            :
                                            <Option value="scale">比例缩放</Option>
                                    }
                                    <Option value="five">50%</Option>
                                    <Option value="seven">75%</Option>
                                    <Option value="noscale">不缩放</Option>
                                </Select>
                            </div>
                            <div
                                className='show-area'
                                ref={this.showArea}
                                style={style}
                            >
                                <Title level={2} className='page-title'>
                                    {this.state.pageConfig.title}
                                </Title>
                                {
                                    this.state.edtArray.map((value,index)=>{
                                        return (
                                            <div
                                                key={value.key}
                                                className={this.state.current===index?'show-outer active':'show-outer'}
                                                onClick={(e)=>{this.selectAera(e,index)}}
                                            >
                                                <Showbox
                                                    data={this.state.data[index]}
                                                    micorkey={value.component.micorkey}
                                                />
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </Boundary.Item>
                </Boundary>
                <Modal
                    title="提示信息"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    cancelText='取消'
                    okText='恢复'
                    maskClosable={false}
                >
                    <p>您有上次离开页面有没保存的数据，是否恢复?</p>
                </Modal>
                <Modal
                    title="添加更多样式"
                    visible={this.state.serchModleVisible}
                    onOk={this.serchHandleOk}
                    onCancel={this.serchHandleCancel}
                    cancelText='取消'
                    okText='确定'
                    maskClosable={false}
                >
                    <div className='serch-more-style'>
                        <span>搜索样式：</span>
                        <DebounceSelect
                            mode="multiple"
                            value={this.state.serchSelectedValue}
                            placeholder="Select users"
                            fetchOptions={this.fetchUserList}
                            onChange={(newValue) => {
                                this.setState({
                                    serchSelectedValue: newValue
                                })
                            }}
                        >
                        </DebounceSelect>
                    </div>
                    <div className='serch-more-style'>
                        <span>添加至分组：</span>
                        <Select
                            value={this.state.groupSelected}
                            placeholder="将新增样式添加至某个分组"
                            dropdownRender={menu => (
                                <div>
                                    {menu}
                                    <Divider style={{ margin: '4px 0' }} />
                                    <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
                                        <Input style={{ flex: 'auto' }} value={this.state.newGroupName} onChange={this.onNameChange} />
                                        <a
                                            style={{ flex: 'none', padding: '8px', display: 'block', cursor: 'pointer' }}
                                            onClick={this.addItem}
                                        >
                                            <PlusOutlined /> 新分组
                                        </a>
                                    </div>
                                </div>
                            )}
                            onChange={this.groupSelectChange}
                        >
                            {this.state.groupItems.map(item => (
                                <Option key={item}>{item}</Option>
                            ))}
                        </Select>
                    </div>
                </Modal>
            </div>
        );
    }
}