import React from 'react';
import './index.css';

import { Input, Typography, Button, Select } from 'antd';

const { Title } = Typography;
const { Option } = Select;

class EdtTimeline extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            style:{},
            timeItems: []
        }
    }
    componentDidMount(){
        if (this.props.data && this.props.data.cpdata){
            this.setState({
                style:this.props.data.cpdata.style||{},
                timeItems:this.props.data.cpdata.timeItems||[]
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
    //更新样式
    updateStyle = (style)=>{
        this.updateData({cpdata:{...this.props.data.cpdata ,style}});
    };
    updateJustify = (e)=>{
        let style = {...this.state.style, justify:e};
        this.setState({
            style
        });
        this.updateStyle(style);
    };
    updateMode = (e)=>{
        let style = {...this.state.style, mode:e};
        this.setState({
            style
        });
        this.updateStyle(style);
    };
    updateWidth = (e)=>{
        if (e.target.value === ''){
            this.setState({
                style:{...this.state.style, width:null}
            });
            this.updateStyle({...this.state.style, width:''});
        }
        else if (/^\d+$/.test(e.target.value)){
            let style = {...this.state.style, width:parseInt(e.target.value)};
            this.setState({
                style
            });
            this.updateStyle(style);
        }
    };
    //添加一个步骤
    addTimeItem = ()=>{
        let timeItems = [...this.state.timeItems,{}];
        this.setState({
            timeItems
        });
        this.updateTimeItem(timeItems);
    };
    //设置步骤内容
    updateTimeItem = (timeItems)=>{
        this.updateData({cpdata:{...this.props.data.cpdata ,timeItems}});
    };
    updateColor = (e, index)=>{
        let newItem = {...this.state.timeItems[index], color:e.target.value};
        this.updateTimeItems(newItem, index);
    };
    updateLabel = (e, index)=>{
        let newItem = {...this.state.timeItems[index], label:e.target.value};
        this.updateTimeItems(newItem, index);
    };
    updateDot = (e, index)=>{
        let newItem = {...this.state.timeItems[index], dot:e.target.value};
        this.updateTimeItems(newItem, index);
    };
    updateText = (e, index)=>{
        let newItem = {...this.state.timeItems[index], text:e.target.value};
        this.updateTimeItems(newItem, index);
    };
    updateTimeItems = (newItem, index)=>{
        let timeItems = [...this.state.timeItems.slice(0,index),newItem,...this.state.timeItems.slice(index+1)];
        this.setState({
            timeItems
        });
        this.updateTimeItem(timeItems);
    };
    //删除一个步骤
    deleteTimeItem = (index)=>{
        let timeItems = [...this.state.timeItems.slice(0,index), ...this.state.timeItems.slice(index+1)];
        this.setState({
            timeItems
        });
        this.updateTimeItem(timeItems);
    };
    render(){
        return(
            <div className='timeline-edt-box'>
                <Title level={5} style={{marginBottom:0}}>基本配置：</Title>
                <Input.Group compact>
                    <Select
                        value={this.state.style.justify||'center'}
                        onChange={this.updateJustify}
                    >
                        <Option key='flex-start'>左对齐</Option>
                        <Option key='flex-end'>右对齐</Option>
                        <Option key='center'>居中</Option>
                    </Select>
                    <Select
                        value={this.state.style.mode||'default'}
                        onChange={this.updateMode}
                    >
                        <Option key='default'>默认</Option>
                        <Option key='left'>左显示</Option>
                        <Option key='right'>右显示</Option>
                        <Option key='alternate'>交叉显示</Option>
                    </Select>
                    <Input
                        placeholder='容器的宽(px)'
                        type='number'
                        value={this.state.style.width}
                        onChange={this.updateWidth}
                    />
                </Input.Group>
                {
                    this.state.timeItems.map((value,index) => {
                        return (
                            <div className='timeline-one-box' key={index}>
                                <div className='timeline-one-title'>
                                    <Title level={5}>第{index+1}步</Title>
                                    <Button
                                        type='danger'
                                        size='small'
                                        onClick={()=>{this.deleteTimeItem(index)}}
                                    >删除这一步</Button>
                                </div>
                                <Input.Group compact>
                                    <Input
                                        type='color'
                                        value={value.color||'#1890ff'}
                                        onChange={(e)=>{this.updateColor(e,index)}}
                                    />
                                    <Input
                                        placeholder='请输入标签'
                                        value={value.label}
                                        onChange={(e)=>{this.updateLabel(e,index)}}
                                    />
                                    <Input
                                        placeholder='请输入节点显示字符'
                                        value={value.dot}
                                        onChange={(e)=>{this.updateDot(e,index)}}
                                    />
                                </Input.Group>
                                <Input
                                    placeholder='请输入步骤文本'
                                    value={value.text}
                                    onChange={(e)=>{this.updateText(e,index)}}
                                />
                            </div>
                        )
                    })
                }
                <Button type='primary' block onClick={this.addTimeItem}>添加步骤</Button>
            </div>
        );
    }
}

EdtTimeline.showTitle='步骤条';

export default EdtTimeline;