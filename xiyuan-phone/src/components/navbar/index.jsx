import React from 'react';
import './index.css';

export default class NavBar extends React.Component {
    render() {
        return (
            <div className='navbar-box'>
                {
                    this.props.leftContent &&
                        <div className='navbar-left'>{this.props.leftContent}</div>
                }
                <div className='navbar-title'>{this.props.children}</div>
                {
                    this.props.rightContent &&
                        <div className='navbar-right'>{this.props.rightContent}</div>
                }
            </div>
        );
    }
}