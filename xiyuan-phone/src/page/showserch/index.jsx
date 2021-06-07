import React from 'react';
import './index.css';

import api from "../../http/api";
import NavBar from '../../components/navbar';
import Loading from '../../components/loading';
import Articlebox from '../../components/articlebox';
import Loadmore from '../../components/loadmore';
import { Select, Input } from 'antd';
import { LeftOutlined, EllipsisOutlined, SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

export default class ShowSerch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data:[],
            translatex: 0,
            config:{},
            category:'所有分类',
            order:'time',
            desc:'desc',
            text:'',
            ismore:true,
            initing:true
        }
    }
    componentDidMount(){
        let config = JSON.parse(sessionStorage.getItem('serchtextabj'));
        config.page = 1;
        this.serch(config);
        this.setState({
            config,
            category:config.category||'所有分类',
            text:config.text||''
        });
    }
    componentWillUnmount(){
        // 卸载异步操作设置状态
        this.setState = (state, callback) => {
            return;
        }
    }
    changePosition = ()=>{
        this.setState({
            translatex:this.state.translatex===0?'-50%':0
        });
    };
    serch = (config, callback)=>{
        sessionStorage.setItem('serchtextabj',JSON.stringify(config));
        api.serchpage(config)
            .then(res=>res.json())
            .then(data=>{
                callback && callback();
                if (data.status === 1){
                    this.setState({
                        data:[...this.state.data, ...data.data],
                        ismore:data.data.length>=10,
                        initing:false
                    });
                }
            })
            .catch(error=>{
                callback && callback();
            });
    };

    onSearch = (e)=>{
        if (e.keyCode !== 13)
            return;
        if (this.state.config.text === e.target.value)
            return;
        let config = {...this.state.config, text:e.target.value, page:1};
        this.serch(config);
        this.setState({
            config,
            data:[]
        });
    };
    textChange = (e)=>{
        this.setState({
            text:e.target.value
        });
    };

    changeCategory = (e)=>{
        let config = {...this.state.config, category:e, page:1, text:this.state.text};
        this.serch(config);
        this.setState({
            category:e,
            config,
            data:[]
        });
    };
    changeOrder = (e)=>{
        let config = {...this.state.config, order:e, page:1, text:this.state.text};
        this.serch(config);
        this.setState({
            order:e,
            config,
            data:[]
        });
    };
    changeDeac = (e)=>{
        let config = {...this.state.config, desc:e, page:1, text:this.state.text};
        this.serch(config);
        this.setState({
            desc:e,
            config,
            data:[]
        });
    };
    //加载更多
    loadMore = (callback)=>{
        let config = {...this.state.config, page:this.state.config.page+1};
        this.serch(config, callback);
        this.setState({
            config
        });
    };
    render() {
        return (
            <div className='showserch-box'>
                <NavBar
                    leftContent={<LeftOutlined onClick={() => {this.props.history.goBack();}}/>}
                    rightContent={<EllipsisOutlined onClick={this.changePosition}/>}
                >
                    <div style={{transform: 'translateX('+this.state.translatex+')'}}>
                        <SearchOutlined/>
                        <Input
                            value={this.state.text}
                            onChange={this.textChange}
                            placeholder='搜索文章'
                            onKeyUp={this.onSearch}
                            bordered={false}
                        />
                        <Select value={this.state.category} onChange={this.changeCategory}>
                            <Option value="所有分类">所有分类</Option>
                            <Option value="计算机">计算机</Option>
                            <Option value="文章">文章</Option>
                            <Option value="笔记">笔记</Option>
                            <Option value="数学">数学</Option>
                            <Option value="分享">分享</Option>
                        </Select>
                        <Select value={this.state.order} onChange={this.changeOrder}>
                            <Option value="time">时间</Option>
                            <Option value="likeCount">点赞数</Option>
                            <Option value="agumentCount">评论数</Option>
                        </Select>
                        <Select value={this.state.desc} onChange={this.changeDeac}>
                            <Option value="desc">降序</Option>
                            <Option value="asc">升序</Option>
                        </Select>
                    </div>
                </NavBar>
                {
                    this.state.initing?
                        <Loading/>
                        :
                        <React.Fragment>
                            {
                                this.state.data.map(value=>{
                                    return (
                                        <Articlebox
                                            key={value.id}
                                            data={value}
                                            history={this.props.history}
                                        />
                                    )
                                })
                            }
                            <Loadmore isMore={this.state.ismore} loadMore={this.loadMore}/>
                        </React.Fragment>
                }
            </div>
        );
    }
}