import React from 'react';
import './index.css';

import { Tabs } from 'antd'

import Actionuser from './actionuser';
import Article from './article';
import Agument from './agument';
import Follow from './follow';

const { TabPane } = Tabs;

export default class Action extends React.Component {
    constructor(props){
        super(props);
        this.count = this.props.match.params.count;
        this.state = {
            activeKey:'1',
            actionData:{}
        }
    }
    TabChange = (e)=>{
        this.setState({
            activeKey:e
        });
    };
    getActionData = (data)=>{
        this.setState({
            actionData:data
        });
    };
    render(){
        return(
            <div className='action-box'>
                <Actionuser
                    count={this.count}
                    history={this.props.history}
                    tabChange={this.TabChange}
                    getActionData={this.getActionData}
                ></Actionuser>
                <Tabs activeKey={this.state.activeKey} onChange={this.TabChange}>
                    <TabPane tab="文章" key="1">
                        <Article
                            count={this.count}
                            history={this.props.history}
                            total={this.state.actionData.pageCount||0}
                        />
                    </TabPane>
                    <TabPane tab="评论" key="2">
                        <Agument
                            count={this.count}
                            history={this.props.history}
                            total={this.state.actionData.agumentCount||0}
                        />
                    </TabPane>
                    <TabPane tab="关注" key="3">
                        <Follow
                            count={this.count}
                            history={this.props.history}
                            total={this.state.actionData.follows?this.state.actionData.follows.length:0}
                        />
                    </TabPane>
                </Tabs>
            </div>
        )
    }
}