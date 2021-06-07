import React from 'react';
import './index.css';

import { RightOutlined } from '@ant-design/icons';

export default class Strip extends React.Component {
    render(){
        return(
            <div
                className='srtip-box'
                onClick={this.props.onClick?(e)=>{this.props.onClick(e)}:null}
            >
                <div className='strip-left'>
                    {this.props.children}
                </div>
                <div className='strip-right'>
                    {this.props.right&&this.props.right}
                    {
                        this.props.rightarrow ?
                            <span style={{width:12,display:'block'}}></span>
                            :
                            <RightOutlined/>
                    }
                </div>
            </div>
        );
    };
}