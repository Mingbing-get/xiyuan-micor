import React from 'react';
import './index.css';

export default class Showuser extends React.Component {
    render(){
        return (
            <div className='showuser-box'>
                {
                    this.props.user && this.props.user.login?
                        <div className='info'>
                            <span>{this.props.user.name}</span>
                            <div
                                className='touxiang'
                                style={{backgroundImage:'url('+this.props.user.touxiang+')'}}
                            ></div>
                        </div>
                        :
                        '登录'
                }
            </div>
        )
    }
}