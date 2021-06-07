import React from 'react';
import './index.css';

import { Input, Select, Typography, Button } from 'antd';

const { Option } = Select;
const { Title } = Typography;
const { TextArea } = Input;

class EdtDescription extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            total:{},
            descriptions:[]
        }
    }
    componentDidMount(){
        if (this.props.data && this.props.data.cpdata){
            this.setState({
                total:this.props.data.cpdata.total?{...this.props.data.cpdata.total}:{},
                descriptions:this.props.data.cpdata.descriptions?[...this.props.data.cpdata.descriptions]:[],
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
    //修改总体布局
    updateTotal = (total)=>{
        this.updateData({cpdata:{...this.props.data.cpdata ,total}});
    };
    updateBorder = (e)=>{
        let total = {...this.state.total, border:e};
        this.setState({
            total
        });
        this.updateTotal(total);
    };
    updateLayout = (e)=>{
        let total = {...this.state.total, layout:e};
        this.setState({
            total
        });
        this.updateTotal(total);
    };
    updateColumn = (e)=>{
        if (e.target.value === ''){
            this.setState({
                total:{...this.state.total, column:null}
            });
            this.updateTotal({...this.state.total, column:''});
        }
        else if (/^\d+$/.test(e.target.value)){
            let total = {...this.state.total, column:parseInt(e.target.value)};
            this.setState({
                total
            });
            this.updateTotal(total);
        }
    };
    updateTitle = (e)=>{
        let total = {...this.state.total, title:e.target.value};
        this.setState({
            total
        });
        this.updateTotal(total);
    };
    //添加一个描述
    addDescription = ()=>{
        let descriptions = [...this.state.descriptions,{}];
        this.setState({
            descriptions
        });
        this.updateDescription(descriptions);
    };
    //设置描述内容
    updateDescription = (descriptions)=>{
        this.updateData({cpdata:{...this.props.data.cpdata ,descriptions}});
    };
    updateDescriptions = (newDescription, index)=>{
        let descriptions = [...this.state.descriptions.slice(0,index),newDescription,...this.state.descriptions.slice(index+1)];
        this.setState({
            descriptions
        });
        this.updateDescription(descriptions);
    };
    updateSpan = (e,index)=>{
        if (e.target.value === ''){
            this.setState({
                descriptions:[...this.state.descriptions.slice(0,index),{...this.state.descriptions[index], span:null},...this.state.descriptions.slice(index+1)]
            });
            let descriptions = [...this.state.descriptions.slice(0,index),{...this.state.descriptions[index], span:''},...this.state.descriptions.slice(index+1)];
            this.updateDescription(descriptions);
        }
        else if (/^\d+$/.test(e.target.value)){
            let newDescription = {...this.state.descriptions[index], span:parseInt(e.target.value)};
            this.updateDescriptions(newDescription, index);
        }
    };
    updateLabel = (e,index)=>{
        let newDescription = {...this.state.descriptions[index], label:e.target.value};
        this.updateDescriptions(newDescription, index);
    };
    updateContent = (e, index)=>{
        let newDescription = {...this.state.descriptions[index], content:e.target.value};
        this.updateDescriptions(newDescription, index);
    };
    //删除一个描述
    deleteDescription = (index)=>{
        let descriptions = [...this.state.descriptions.slice(0,index), ...this.state.descriptions.slice(index+1)];
        this.setState({
            descriptions
        });
        this.updateDescription(descriptions);
    };
    render() {
        return (
            <div className='description-edt-box'>
                <Title level={5} style={{marginBottom:0}}>基本配置：</Title>
                <Input.Group compact>
                    <Select
                        value={this.state.total.border||'bordered'}
                        onChange={this.updateBorder}
                    >
                        <Option value="bordered">有边框</Option>
                        <Option value="no-bordered">无边框</Option>
                    </Select>
                    <Select
                        value={this.state.total.layout||'horizontal'}
                        onChange={this.updateLayout}
                    >
                        <Option value="horizontal">水平排列</Option>
                        <Option value="vertical">垂直排列</Option>
                    </Select>
                    <Input
                        placeholder='总列数(默认为3)'
                        type='number'
                        value={this.state.total.column}
                        onChange={this.updateColumn}
                    />
                    <Input
                        placeholder='描述列表的标题'
                        value={this.state.total.title}
                        onChange={this.updateTitle}
                    />
                </Input.Group>
                {
                    this.state.descriptions.map((value,index) => {
                        return (
                            <div className='description-one-box' key={index}>
                                <div className='description-one-title'>
                                    <Title level={5}>第{index+1}个描述</Title>
                                    <Button
                                        type='danger'
                                        size='small'
                                        onClick={()=>{this.deleteDescription(index)}}
                                    >删除该描述</Button>
                                </div>
                                <Input.Group compact>
                                    <Input
                                        placeholder='占用列数(默认为1)'
                                        type='number'
                                        style={{flex:1}}
                                        value={value.span}
                                        onChange={(e)=>{this.updateSpan(e,index)}}
                                    />
                                    <Input
                                        placeholder='标签内容'
                                        style={{flex:2}}
                                        value={value.label}
                                        onChange={(e)=>{this.updateLabel(e,index)}}
                                    />
                                </Input.Group>
                                <TextArea
                                    rows={2}
                                    placeholder='请输入主要内容'
                                    value={value.content}
                                    onChange={(e)=>{this.updateContent(e,index)}}
                                />
                            </div>
                        )
                    })
                }
                <Button type='primary' block onClick={this.addDescription}>添加描述</Button>
            </div>
        );
    }
}

EdtDescription.showTitle = '描述列表';

export default EdtDescription;