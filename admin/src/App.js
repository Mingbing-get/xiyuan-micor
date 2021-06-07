import React from 'react';
import './App.css';

import Router from './router.js';
import api from './http/api.js';

export default class App extends React.Component {
    //去后台获取登录状态
    componentDidMount(){
        api.islogin()
            .then(res=>res.json())
            .then(data=>{
                if(data.status===0){
                    sessionStorage.removeItem('admin');
                    window.location.href = '#/login';
                }
                else {
                    sessionStorage.setItem('admin',JSON.stringify(data.admin));
                    if (window.location.href.indexOf('#/index') === -1){
                        window.location.href = '#/index';
                    }
                }
            })
            .catch(error=>{
                sessionStorage.removeItem('admin');
                window.location.href = '#/login';
            });
    };
    render() {
        return (
            <Router/>
        );
    }
}
