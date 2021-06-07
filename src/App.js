import React from 'react';
import './App.css';

import io from 'socket.io-client';

import { connect } from 'react-redux';
import { login } from './redux/action/login.js';
import { setSocket } from './redux/action/socket.js';
import { setNoread } from './redux/action/noread.js';

import api from './http/api.js';

import './base/base.js';

import Index from './page/index';

class App extends React.Component {
    componentDidMount(){
        api.islogin()
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    let socket = io.connect('ws://192.168.1.241:5000');
                    // let socket = io.connect('ws://39.97.168.93:5000');
                    // let socket = io.connect('ws://192.168.1.5:5000');
                    socket.emit('user', data.user.count);//将该用户告诉服务器我是谁
                    //监听有谁给我发消息，收到消息进行之后的处理
                    socket.on('message', (data)=>{
                        if (this.props.noread !== -1)
                            this.props.setNoread(1);
                    });

                    this.props.setSocket(socket);
                    this.props.login(data.user);
                    localStorage.setItem('user', JSON.stringify(data.user));

                    //去后台获取该用户有多少未读消息
                    return api.getnoreadmun(data.user.count);
                }
                else{
                    localStorage.removeItem('user');
                    throw new Error('获取未读信息失败');
                }
            })
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    this.props.setNoread(data.number);
                }
            })
            .catch(error=>{});
    }
    render(){
        return (
            <div>
                <Index/>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.loginReducer,
        socket: state.socketReducer,
        noread: state.noreadReaducer,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        login:(user)=>{ dispatch(login(user)) },
        setSocket:(socket)=>{dispatch(setSocket(socket))},
        setNoread:(noread)=>{dispatch(setNoread(noread))},
    }
};

App = connect(mapStateToProps, mapDispatchToProps)(App);
export default App;