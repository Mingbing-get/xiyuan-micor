import React, { Component } from 'react';
import './index.css';

import api from '../../http/api.js';

import Articlebox from '../../components/articlebox'
import Loadmore from '../../components/loadmore';
import Loading from '../../components/loading';

class Liketop extends Component {
    constructor(props) {
        super(props);
        this.state = {
            config:{page:1,order:'likeCount'},
            data:[],
            ismore:true,
            initing:true
        }
    }

    componentDidMount(){
        this.getData(this.state.config);
    }
    componentWillUnmount(){
        // 卸载异步操作设置状态
        this.setState = (state, callback) => {
            return;
        }
    }
    getData(config, callback){
        api.serchpage(config)
            .then(res=>res.json())
            .then(data=>{
                callback && callback();
                if (data.status === 1){
                    this.setState({
                        data:[...this.state.data, ...data.data],
                        config:{...this.state.config, page:this.state.config.page+1},
                        ismore:data.data.length>=10,
                        initing:false
                    });
                }
            })
            .catch(error=>{
                callback && callback();
            });
    }
    loadMore = (callback)=>{
        this.getData(this.state.config, callback);
    };
    render() {
        return (
            this.state.initing?
                <Loading/>
                :
                <div className='like-top-box'>
                    {
                        this.state.data.map((value, index)=>{
                            return (
                                <div key={value.id} className='like-top-one'>
                                    <span>{index+1}</span>
                                    <Articlebox
                                        data={value}
                                        history={this.props.history}
                                    />
                                </div>
                            )
                        })
                    }
                    <Loadmore isMore={this.state.ismore} loadMore={this.loadMore}/>
                </div>
        )
    }
}
export default Liketop;