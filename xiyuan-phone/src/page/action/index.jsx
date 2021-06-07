import React from 'react';
import './index.css';

import NavBar from '../../components/navbar';
import { Tabs } from 'antd'
import { LeftOutlined } from '@ant-design/icons';

import Article from './article';
import Agument from './agument';
import Follow from './follow';
import Actionuser from "./actionuser";

const { TabPane } = Tabs;

export default class Action extends React.Component {
    constructor(props){
        super(props);
        this.count = this.props.match.params.count;
        this.user = JSON.parse(localStorage.getItem('user'));
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
    render() {
        return (
            <div className='action-box'>
                <NavBar
                    leftContent={<LeftOutlined onClick={() => {this.props.history.goBack();}}/>}
                >{this.state.actionData.name&&(this.user&&this.user.count===this.count?'我的':this.state.actionData.name+'的')}动态</NavBar>
                <Actionuser
                    count={this.count}
                    history={this.props.history}
                    getActionData={this.getActionData}
                ></Actionuser>
                <Tabs activeKey={this.state.activeKey} centered onChange={this.TabChange}>
                    <TabPane tab={"文章("+(this.state.actionData.pageCount||0)+")"} key="1">
                        <Article
                            count={this.count}
                            history={this.props.history}
                            total={this.state.actionData.pageCount||0}
                        />
                    </TabPane>
                    <TabPane tab={"评论("+(this.state.actionData.agumentCount||0)+")"} key="2">
                        <Agument
                            count={this.count}
                            history={this.props.history}
                            total={this.state.actionData.agumentCount||0}
                        />
                    </TabPane>
                    <TabPane tab={"关注("+(this.state.actionData.follows?this.state.actionData.follows.length:0)+")"} key="3">
                        <Follow
                            count={this.count}
                            history={this.props.history}
                            total={this.state.actionData.follows?this.state.actionData.follows.length:0}
                        />
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}