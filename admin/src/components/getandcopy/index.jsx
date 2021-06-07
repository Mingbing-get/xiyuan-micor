import React from "react";
import './index.css';

import { Button, Tooltip, message} from "antd";
import {CopyOutlined } from '@ant-design/icons';

export default class Getandcopy extends React.Component {
    constructor(props) {
        super(props);
        this.copyRef = React.createRef();
        this.state = {
            content:''
        }
    }

    getcontent = ()=>{
        this.props.getcontent && this.props.getcontent((content)=>{
            this.setState({
                content
            });
        });
    };

    copyClick = ()=>{
        if (!this.state.content){
            message.destroy();
            message.warning('内容为空，复制失败!');
            return;
        }
        this.copyRef.current.value = this.state.content; // 修改文本框的内容
        this.copyRef.current.select(); // 选中文本
        document.execCommand("copy");
        message.destroy();
        message.success('复制成功!');
    };

    render() {
        return (
            <div className='get-copy-box'>
                <Button
                    onClick={this.getcontent}
                    size='small'
                    type="primary"
                    disabled={this.props.disabled}
                >
                    {this.props.btntext}
                </Button>
                <Tooltip title='复制'>
                    <CopyOutlined onClick={this.copyClick}/>
                </Tooltip>
                <textarea ref={this.copyRef}></textarea>
                <p>{this.state.content}</p>
            </div>
        );
    }
}