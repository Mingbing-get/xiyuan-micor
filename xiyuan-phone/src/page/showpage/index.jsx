import React, { createElement } from 'react';
import './index.css';

import NavBar from '../../components/navbar';
import Loading from '../../components/loading';
import { LeftOutlined } from '@ant-design/icons';
import api from "../../http/api";

import Loadmore from '../../components/loadmore';
import { Typography, Comment, Tooltip, Avatar, Select, message, Input, Button, Collapse } from 'antd';
import { LikeOutlined, LikeFilled, PlusOutlined, EditOutlined } from '@ant-design/icons';

import Showbox from './showbox';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

export default class Action extends React.Component {
    constructor(props){
        super(props);
        this.user = JSON.parse(localStorage.getItem('user'));
        this.state = {
            data:null,
            writer:null,
            versions:null,
            showArray:[],
            componentData:[],
            aguments:[],
            childagusText:[],
            childagusDisabled:[],
            likeNumber:0,
            islike:false,
            isfollow:false,
            isself:false,
            agumentText:'',
            disabledTextArea:false,
            currentPage:1,
            offset:0,
            ismore:true,
            havedata:true,
            initing:true
        }
    }
    componentDidMount(){
        let params = this.props.match.params;
        api.querypagebyversion(params.count, params.url, params.version, this.user&&this.user.count)
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    this.setState({
                        initing: false
                    });
                    this.afterGetData(data);
                }
                else {
                    this.setState({
                        havedata: false,
                        initing: false
                    });
                }
            })
            .catch(error=>{
                this.setState({
                    havedata: false,
                    initing: false
                });
            });
    };
    componentWillUpdate(){
        const user = JSON.parse(localStorage.getItem('user'));
        if ((user && !this.user) || (!user && this.user)){
            this.user = user;
            this.setState({
                islike:this.user && this.state.data.likes.includes(this.user.count),
                isfollow:this.user && this.state.writer.follows.includes(this.user.count),
                isself:this.user && this.state.writer.count === this.user.count
            });
        }
    }
    componentWillUnmount(){
        // ??????????????????????????????
        this.setState = (state, callback) => {
            return;
        }
    }
    //?????????????????????????????????????????????
    afterGetData = async (data)=>{
        if (typeof data.data === "string"){
            this.setState({
                data:data.data
            });
            return;
        }
        let componentData = [];
        let showArray = [];
        for (let i = 0; i < data.data.componentData.length; i++){
            const value = data.data.componentData[i];
            value.cpdata = JSON.parse(value.cpdata.replace(/\n/g,"\\n").replace(/\r/g,"\\r"));
            let micorRes = await api.showcomponent({micorkey: value.cpname});
            micorRes = await micorRes.json();
            showArray.push(micorRes.data[0]);
            componentData.push({cpdata:value.cpdata});
        }
        this.setState({
            data:data.data,
            writer:data.writer,
            versions:data.versions,
            aguments:data.aguments,
            ismore:data.aguments.length>=6,
            childagusText:new Array(data.aguments.length).fill(''),
            childagusDisabled:new Array(data.aguments.length).fill(false),
            showArray,
            componentData,
            likeNumber:data.data.likes.length,
            islike:this.user && data.data.likes.includes(this.user.count),
            isfollow:this.user && data.writer.follows.includes(this.user.count),
            isself:this.user && data.writer.count === this.user.count
        });
    };
    //??????????????????
    versionChange = (version)=>{
        api.querypagebyversion(this.state.data.usercount, this.state.data.url, version, this.user&&this.user.count)
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    this.afterGetData(data);
                }
                else {
                    this.setState({
                        havedata: false
                    });
                }
            })
            .catch(error=>{
                this.setState({
                    havedata: false
                });
            });
    };
    //????????????
    likeClick = ()=>{
        if (this.state.islike)
            return;
        if (this.islogin() === -1)
            return;
        if (this.state.isself){
            message.destroy();
            message.warning('??????????????????!');
            return;
        }
        api.addpagelike(this.state.data.id, this.user.count)
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    this.setState({
                        islike:true,
                        likeNumber:this.state.likeNumber+1
                    });
                }
                else {
                    message.destroy();
                    message.warning('????????????!');
                }
            })
            .catch(error=>{
                message.destroy();
                message.warning('????????????!');
            });
    };
    //????????????
    followClick = ()=>{
        if (this.state.isfollow)
            return;
        if (this.islogin() === -1)
            return;
        if (this.state.writer.count === this.user.count){
            message.destroy();
            message.warning('??????????????????!');
            return;
        }
        api.addfollow(this.state.writer.count, this.user.count)
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    this.setState({
                        isfollow:true
                    });
                }
                else {
                    message.destroy();
                    message.warning('????????????!');
                }
            })
            .catch(error=>{
                message.destroy();
                message.warning('????????????!');
            });
    };
    //???????????????????????????????????????action??????
    toAction(count){
        this.props.history.push('/action/'+count);
    }
    //????????????
    agumentChange = (e)=>{
        this.setState({
            agumentText:e.target.value
        });
    };
    submitAgument = ()=>{
        if (this.islogin() === -1)
            return;
        if (this.state.agumentText === ''){
            message.destroy();
            message.warning('??????????????????!');
            return;
        }
        this.setState({
            disabledTextArea:true
        });
        let data = {
            usercount:this.user.count,
            content:this.state.agumentText,
            pageid:this.state.data.id
        };
        api.addagument(JSON.stringify(data))
            .then(res=>res.json())
            .then(rdata=>{
                if (rdata.status === 1){
                    this.setState({
                        disabledTextArea:false,
                        aguments:[{...data, ...rdata.data, name:this.user.name, touxiang:this.user.touxiang},...this.state.aguments],
                        agumentText:'',
                        offset:this.state.offset+1
                    });
                    message.destroy();
                    message.success('????????????!');
                }
                else {
                    this.setState({
                        disabledTextArea:false
                    });
                    message.destroy();
                    message.warning('????????????!');
                }
            })
            .catch(error=>{
                this.setState({
                    disabledTextArea:false
                });
                message.destroy();
                message.warning('????????????!');
            });
    };
    childagusChange = (e,index)=>{
        this.setState({
            childagusText:[...this.state.childagusText.slice(0,index), e.target.value, ...this.state.childagusText.slice(index+1)]
        });
    };
    submitChildagus = (id, index)=>{
        if (this.islogin() === -1)
            return;
        if (this.state.childagusText[index] === ''){
            message.destroy();
            message.warning('??????????????????!');
            return;
        }
        this.setState({
            childagusDisabled:[...this.state.childagusDisabled.slice(0,index), true, ...this.state.childagusDisabled.slice(index+1)]
        });
        let data = {
            usercount:this.user.count,
            content:this.state.childagusText[index],
            parentid:id
        };
        api.addchildagu(JSON.stringify(data))
            .then(res=>res.json())
            .then(rdata=>{
                if (rdata.status === 1){
                    let nowthisagument = {...this.state.aguments[index]};
                    if (!nowthisagument.childagus)
                        nowthisagument.childagus = [];
                    nowthisagument.childagus = [...nowthisagument.childagus, {...data, ...rdata.data, name:this.user.name, touxiang:this.user.touxiang}];
                    this.setState({
                        childagusDisabled:[...this.state.childagusDisabled.slice(0,index), false, ...this.state.childagusDisabled.slice(index+1)],
                        childagusText:[...this.state.childagusText.slice(0,index), '', ...this.state.childagusText.slice(index+1)],
                        aguments:[...this.state.aguments.slice(0,index), nowthisagument, ...this.state.aguments.slice(index+1)],
                    });
                    message.destroy();
                    message.success('????????????!');
                }
                else {
                    this.setState({
                        childagusDisabled:[...this.state.childagusDisabled.slice(0,index), false, ...this.state.childagusDisabled.slice(index+1)]
                    });
                    message.destroy();
                    message.warning('????????????!');
                }
            })
            .catch(error=>{
                this.setState({
                    childagusDisabled:[...this.state.childagusDisabled.slice(0,index), false, ...this.state.childagusDisabled.slice(index+1)]
                });
                message.destroy();
                message.warning('????????????!');
            });
    };

    //??????????????????,?????????????????????
    loadMore = (callback)=>{
        api.loadmoreagument(this.state.data.id, this.state.currentPage+1, this.state.offset)
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    this.setState({
                        aguments:[...this.state.aguments, ...data.aguments],
                        currentPage:this.state.currentPage+1,
                        ismore:data.aguments.length>=6
                    });
                    message.destroy();
                    message.success('????????????????????????!');
                }
                else {
                    message.destroy();
                    message.warning('????????????????????????!');
                }
                callback();
            })
            .catch(error=>{
                callback();
                message.destroy();
                message.warning('????????????????????????!');
            });
    };

    //???????????????????????????????????????????????????????????????????????????????????????????????????
    islogin = ()=>{
        if (!this.user) {
            message.destroy();
            message.info('????????????!');
            this.props.history.push('/login');
            return -1;
        }
        return 1
    };
    render() {
        let actions = [
            <Tooltip key="comment-basic-like" title="??????">
                <span onClick={this.likeClick} style={{fontSize:14}}>
                    {createElement(this.state.islike ? LikeFilled : LikeOutlined)}
                    <span style={{marginLeft:3}}>{this.state.likeNumber}</span>
                </span>
            </Tooltip>
        ];
        if (!this.state.isself){
            actions.push(this.state.isfollow?
                <span className='follow ygz'>?????????</span>
                :
                <span className='follow' onClick={this.followClick}><PlusOutlined/>??????</span>);
        }
        return (
            <div className='show-page-box-phone'>
                <NavBar
                    leftContent={<LeftOutlined onClick={() => {this.props.history.goBack();}}/>}
                >??????</NavBar>
                {
                    this.state.initing?
                        <Loading/>
                        :
                        <div className='show-page-main'>
                            {
                                typeof this.state.data === 'string' || !this.state.havedata?
                                    <div className='showpage-nolook'>{this.state.havedata?this.state.data:'?????????????????????'}</div>
                                    :
                                    <div className='show-page-box'>
                                        {
                                            this.state.data && this.state.data.title &&
                                            <div className='page-title-box'>
                                                <Title level={4} className='page-title'>
                                                    {this.state.data.title}
                                                </Title>
                                                <Select defaultValue={this.state.data.version} style={{ width: 50 }} onChange={this.versionChange}>
                                                    {
                                                        this.state.versions.map(value=>{
                                                            return (
                                                                <Option key={value} value={value}>{'??'+value}</Option>
                                                            )
                                                        })
                                                    }
                                                </Select>
                                            </div>
                                        }
                                        {
                                            this.state.writer && this.state.data &&
                                            <Comment
                                                style={{width:210, margin:'0 auto 10px'}}
                                                actions={actions}
                                                author={<a>{this.state.writer.name}</a>}
                                                avatar={
                                                    <Avatar
                                                        src={this.state.writer.touxiang}
                                                        alt={this.state.writer.name}
                                                        onClick={()=>{this.toAction(this.state.writer.count)}}
                                                    />
                                                }
                                                datetime={
                                                    <span>{new Date(this.state.data.time).format('yyyy/MM/dd hh:mm:ss')}</span>
                                                }
                                            />
                                        }
                                        {
                                            this.state.showArray.map((value,index)=>{
                                                return (
                                                    <Showbox
                                                        data={this.state.componentData[index]}
                                                        micorkey={value.micorkey}
                                                        key={`${value.id}${index}`}
                                                    />
                                                )
                                            })
                                        }
                                        <div className='show-page-send-agument'>
                                            <Title level={5}>???????????????</Title>
                                            <TextArea
                                                rows={4}
                                                placeholder='??????????????????(?????????200???)'
                                                value={this.state.agumentText}
                                                onChange={this.agumentChange}
                                                showCount
                                                maxLength={200}
                                            />
                                            <Button
                                                type='primary'
                                                style={{marginTop:10}}
                                                disabled={this.state.disabledTextArea}
                                                onClick={this.submitAgument}
                                            >????????????</Button>
                                        </div>
                                        <div className='show-page-show-agument'>
                                            <Title level={5}>???????????????</Title>
                                            {
                                                this.state.aguments.map((value, index) => {
                                                    return(
                                                        <Comment
                                                            key={value.id}
                                                            author={<a>{value.name}</a>}
                                                            avatar={<Avatar src={value.touxiang} onClick={()=>{this.toAction(value.usercount)}}/>}
                                                            content={<p>{value.content}</p>}
                                                            datetime={<span>{new Date(value.time).format('yyyy/MM/dd hh:mm:ss')}</span>}
                                                            style={{borderBottom:'1px solid #ddd'}}
                                                        >
                                                            {
                                                                value.childagus &&
                                                                value.childagus.map(childvalue => {
                                                                    return (
                                                                        <Comment
                                                                            key={childvalue.id}
                                                                            author={<a>{childvalue.name}</a>}
                                                                            avatar={<Avatar src={childvalue.touxiang} onClick={()=>{this.toAction(childvalue.usercount)}}/>}
                                                                            content={<p>{childvalue.content}</p>}
                                                                            datetime={<span>{new Date(childvalue.time).format('yyyy/MM/dd hh:mm:ss')}</span>}
                                                                            style={{borderBottom:'1px solid #ddd'}}
                                                                        />
                                                                    )
                                                                })
                                                            }
                                                            <Collapse
                                                                bordered={false}
                                                                expandIcon={()=><EditOutlined />}
                                                                style={{backgroundColor:'#fff'}}
                                                            >
                                                                <Panel header="???????????????" style={{borderBottom:'none'}}>
                                            <TextArea
                                                rows={4}
                                                placeholder='??????????????????(?????????200???)'
                                                value={this.state.childagusText[index]}
                                                onChange={(e)=>{this.childagusChange(e, index)}}
                                                showCount
                                                maxLength={200}
                                            />
                                                                    <Button
                                                                        type='primary'
                                                                        style={{marginTop:10}}
                                                                        disabled={this.state.childagusDisabled[index]}
                                                                        onClick={()=>{this.submitChildagus(value.id, index)}}
                                                                    >????????????</Button>
                                                                </Panel>
                                                            </Collapse>
                                                        </Comment>
                                                    )
                                                })
                                            }
                                        </div>
                                        <Loadmore isMore={this.state.ismore} loadMore={this.loadMore}/>
                                    </div>
                            }
                        </div>
                }
            </div>
        );
    }
}