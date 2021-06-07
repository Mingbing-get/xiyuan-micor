import React from 'react';
import './index.css';

import { Select, Input } from 'antd';

const { Option } = Select;

class EdtDivider extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            style:{},
            text:''
        }
    }

    componentDidMount(){
        if (this.props.data && this.props.data.cpdata){
            this.setState({
                style:this.props.data.cpdata.style || {},
                text:this.props.data.cpdata.text || ''
            });
        }
    };

    updateData = (newdata)=>{
        this.props.updateData &&
        this.props.updateData(this.props.index, {
            ...this.props.data,
            ...newdata
        });
    };
    //修改文本
    updateText = (e)=>{
        this.setState({
            text:e.target.value
        });
        this.updateData({cpdata:{...this.props.data.cpdata ,text:e.target.value}});
    };
    //修改样式
    updateStyle = (style)=>{
        this.updateData({cpdata:{...this.props.data.cpdata ,style}});
    };
    updateType = (e)=>{
        let style = {...this.state.style, type:e};
        this.setState({
            style
        });
        this.updateStyle(style);
    };
    updateOrientation = (e)=>{
        let style = {...this.state.style, orientation:e};
        this.setState({
            style
        });
        this.updateStyle(style);
    };
    updateWeight = (e)=>{
        let style = {...this.state.style, weight:e};
        this.setState({
            style
        });
        this.updateStyle(style);
    };

    render() {
        return (
            <div className='divider-edt-box'>
                <Input.Group compact>
                    <Select
                        value={this.state.style.type || 'solid'}
                        onChange={this.updateType}
                    >
                        <Option key='solid'>实线</Option>
                        <Option key='dashed'>虚线</Option>
                    </Select>
                    <Select
                        value={this.state.style.orientation || 'center'}
                        onChange={this.updateOrientation}
                    >
                        <Option key='center'>居中</Option>
                        <Option key='left'>左对齐</Option>
                        <Option key='right'>右对齐</Option>
                    </Select>
                    <Select
                        value={this.state.style.weight || 'normal'}
                        onChange={this.updateWeight}
                    >
                        <Option key='normal'>普通</Option>
                        <Option key='bold'>加粗</Option>
                    </Select>
                    <Input
                        placeholder='请输入文本'
                        value={this.state.text}
                        onChange={this.updateText}
                    />
                </Input.Group>
            </div>
        );
    }
}

EdtDivider.showTitle = '分割线';

export default EdtDivider;