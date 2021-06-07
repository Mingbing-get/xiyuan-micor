import React from 'react';
import './index.css';

import { Button } from 'antd';

export default class Loadmore extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:false
        }
    }

    loadmoreClick = ()=>{
        this.setState({
            loading:true
        });
        this.props.loadMore && this.props.loadMore(()=>{
            this.setState({
                loading:false
            });
        });
    };

    render() {
        return (
            <div style={{marginTop:20, textAlign:'center'}}>
                {
                    this.props.isMore?
                        <Button type="primary" loading={this.state.loading} onClick={this.loadmoreClick}>
                            加载更多
                        </Button>
                        :
                        <p>没有更多数据...</p>
                }
            </div>
        );
    }
}