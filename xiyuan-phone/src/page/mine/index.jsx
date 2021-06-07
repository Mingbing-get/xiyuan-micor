import React from 'react';
import './index.css';

import Router from '../../router';
import NavBar from '../../components/navbar';
import Info from './info';
import Strip from '../../components/strip';
import { LeftOutlined } from '@ant-design/icons';

import { connect } from 'react-redux';

class Mine extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null
        }
    };

    componentDidMount(){
        let user = this.props.user;
        if (!user.login){
            user = {...JSON.parse(localStorage.getItem('user'))};
            if (user.count)
                user.login = true;
        }
        if (user.login){
            this.setState({
                user
            });
            return;
        }
        this.setState({
            user:{login:false, name:'未登录'}
        });
    };
    infoClick = (e)=>{
        this.props.history.push('/updatemine');
    };
    publishClick = (e)=>{
        this.props.history.push('/publish');
    };
    draftClick = (e)=>{
        this.props.history.push('/draft');
    };
    actionClick = (e)=>{
        if (!this.state.user.count){
            this.props.history.push('/login');
            return;
        }
        this.props.history.push('/action/'+this.state.user.count);
    };
    feedbackClick = (e)=>{
        this.props.history.push('/feedback');
    };
    render() {
        return (
            <div className='mine-box'>
                <NavBar
                    leftContent={<LeftOutlined onClick={() => {this.props.history.goBack();}}/>}
                >我的</NavBar>
                {
                    this.state.user&&
                    <Info
                        user={this.state.user}
                        infoClick={(e)=>{this.infoClick(e)}}
                    />
                }
                <Strip
                    onClick={this.publishClick}
                >
                    我的文章
                </Strip>
                <Strip
                    onClick={this.draftClick}
                >
                    我的草稿
                </Strip>
                <Strip
                    onClick={this.actionClick}
                >
                    我的动态
                </Strip>
                <Strip
                    onClick={this.feedbackClick}
                >
                    意见反馈
                </Strip>
                <Router/>
            </div>
        );
    }
}

const mapStoreToProps = (store)=>{
    return {
        user:store.loginReducer
    };
};

Mine = connect(mapStoreToProps)(Mine);

export default Mine;