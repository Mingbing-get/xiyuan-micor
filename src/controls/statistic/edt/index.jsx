import React from 'react';
import './index.css';

import { Input, Switch, Select, Button, Typography } from 'antd';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

class EdtStatistic extends React.Component {
    constructor(props) {
        super(props);
        this.fangdou = null;
        this.state = {
            option:{},
            xAxisData:'',
            style:{}
        };
    }
    componentDidMount(){
        if (this.props.data && this.props.data.cpdata){
            this.setState({
                style:this.props.data.cpdata.style?{...this.props.data.cpdata.style}:{},
                option:this.props.data.cpdata.option?{...this.props.data.cpdata.option}:{},
                xAxisData:this.props.data.cpdata.option && this.props.data.cpdata.option.xAxis && this.props.data.cpdata.option.xAxis.data
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
    //更新最外层容器的样式
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
    updateHeight = (e)=>{
        if (e.target.value === ''){
            this.setState({
                style:{...this.state.style, height:null}
            });
            this.updateStyle({...this.state.style, height:''});
        }
        else if (/^\d+$/.test(e.target.value)){
            let style = {...this.state.style, height:parseInt(e.target.value)};
            this.setState({
                style
            });
            this.updateStyle(style);
        }
    };
    //更新画布的内容
    updateOption = (option)=>{
        //做防抖效果，防止快速的修改
        clearTimeout(this.fangdou);
        this.fangdou = setTimeout(()=>{
            this.updateData({cpdata:{...this.props.data.cpdata ,option}});
        },1000);
    };
    updateTitle = (e)=>{
        if (e.target.value){
            let title = {text:e.target.value, left:'center'};
            let option = {...this.state.option,title};
            this.setState({
                option
            });
            this.updateOption(option);
        }
        else {
            this.deleteOptionKeys(['title']);
        }
    };
    updateTooltip = (e)=>{
        if (e) {
            let option = {...this.state.option,tooltip:{}};
            this.setState({
                option
            });
            this.updateOption(option);
        }
        else {
            this.deleteOptionKeys(['tooltip']);
        }
    };
    updateLegend = (e)=>{
        if (e) {
            let option = {...this.state.option,legend:{}};
            this.setState({
                option
            });
            this.updateOption(option);
        }
        else {
            this.deleteOptionKeys(['legend']);
        }
    };
    updateAxis = (e)=>{
        if (e){
            let option = {...this.state.option,xAxis:{data:this.state.xAxisData},yAxis:{}};
            this.setState({
                option
            });
            this.updateOption(option);
        }
        else {
            this.deleteOptionKeys(['xAxis','yAxis']);
        }
    };
    updateAxisData = (e)=>{
        if (e.target.value){
            let xAxis = {data:e.target.value, left:'center'};
            let option = {...this.state.option,xAxis};
            this.setState({
                option,
                xAxisData:e.target.value
            });
            this.updateOption(option);
        }
        else {
            let option = {...this.state.option,xAxis:{}};
            this.setState({
                option,
                xAxisData:''
            });
            this.updateOption(option);
        }
    };
    //增加图形
    addStatistic = ()=>{
        let series = [];
        if (this.state.option.series)
            series = [...this.state.option.series,{type:'pie'}];
        else
            series.push({type:'pie'});
        let option = {...this.state.option,series};
        this.setState({
            option
        });
        this.updateOption(option);
    };
    updateType = (e, index)=>{
        let current = {...this.state.option.series[index], type:e};
        this.updateSeries(current, index);
    };
    updateName = (e, index)=>{
        let current = {...this.state.option.series[index], name:e.target.value};
        this.updateSeries(current, index);
    };
    updateOneData = (e, index)=>{
        let current = {...this.state.option.series[index], data:e.target.value};
        this.updateSeries(current, index);
    };
    updateSeries = (current, index)=>{
        let option = {...this.state.option,series:[...this.state.option.series.slice(0,index),current,...this.state.option.series.slice(index+1)]};
        this.setState({
            option
        });
        this.updateOption(option);
    };
    //删除图形
    deleteStatistic = (index)=>{
        let option = {...this.state.option,series:[...this.state.option.series.slice(0,index),...this.state.option.series.slice(index+1)]};
        this.setState({
            option
        });
        this.updateOption(option);
    };
    //针对不同的图形类型显示不同的提示
    showPlaceholder = (type)=>{
        let placeholder = '请输入数据(如：1,2,3,4)';
        switch (type) {
            case 'pie':
                placeholder = '请输入数据(如：键,1,键,2)';
                break;
            case 'scatter' :
                placeholder = '请输入数据(如：1,2,3,4)，若有x轴标识，则数据一 一对应标识；若没有，则数据成对作为x，y轴的值';
                break;
            default:
                break;
        }
        return placeholder;
    };
    //删除option中的某些键值对
    deleteOptionKeys = (keys)=>{
        let option = {};
        for(let key in this.state.option){
            if (keys.includes(key))
                continue;
            option[key] = this.state.option[key];
        }
        this.setState({
            option
        });
        this.updateOption(option);
    };

    render() {
        return (
            <div className='statistic-edt-box'>
                <Title level={5} style={{marginBottom:0}}>基本配置：</Title>
                <Input.Group compact>
                    <Select
                        value={this.state.style.justify||'center'}
                        onChange={this.updateJustify}
                    >
                        <Option value="flex-start">左对齐</Option>
                        <Option value="center">居中</Option>
                        <Option value="flex-end">右对齐</Option>
                    </Select>
                    <Input
                        placeholder='图的宽(px)'
                        type='number'
                        value={this.state.style.width}
                        onChange={this.updateWidth}
                    />
                    <Input
                        placeholder='图的高(px)'
                        type='number'
                        value={this.state.style.height}
                        onChange={this.updateHeight}
                    />
                </Input.Group>
                <Input
                    placeholder='请输入标题'
                    value={this.state.option.title && this.state.option.title.text}
                    onChange={this.updateTitle}
                />
                <div className='statistic-edt-switch-box'>
                    <div>
                        <span>提示：</span>
                        <Switch
                            checkedChildren="显示"
                            unCheckedChildren="隐藏"
                            checked={this.state.option.tooltip}
                            onChange={this.updateTooltip}
                        />
                    </div>
                    <div>
                        <span>说明：</span>
                        <Switch
                            checkedChildren="显示"
                            unCheckedChildren="隐藏"
                            checked={this.state.option.legend}
                            onChange={this.updateLegend}
                        />
                    </div>
                    <div>
                        <span>坐标：</span>
                        <Switch
                            checkedChildren="显示"
                            unCheckedChildren="隐藏"
                            checked={this.state.option.xAxis}
                            onChange={this.updateAxis}
                        />
                    </div>
                </div>
                {
                    this.state.option.xAxis &&
                        <TextArea
                            rows={2}
                            placeholder='请输入x轴标识(以逗号分割，如：第一，第二，第三)'
                            value={this.state.xAxisData}
                            onChange={this.updateAxisData}
                        />
                }
                {
                    this.state.option.series && this.state.option.series.map((value, index)=>{
                        return (
                            <div className='statistic-edt-one' key={index}>
                                <div className='one-title'>
                                    <Title level={5}>图{index+1}：</Title>
                                    <Button type='danger' size='small' onClick={()=>{this.deleteStatistic(index)}}>删除该图形</Button>
                                </div>
                                <Input.Group compact>
                                    <Select
                                        value={value.type||'pie'}
                                        onChange={(e)=>{this.updateType(e, index)}}
                                    >
                                        <Option value="bar" disabled={!this.state.option.xAxis}>条形图</Option>
                                        <Option value="line" disabled={!this.state.option.xAxis}>折线图</Option>
                                        <Option value="scatter" disabled={!this.state.option.xAxis}>散点图</Option>
                                        <Option value="pie">饼图</Option>
                                    </Select>
                                    <Input
                                        placeholder='图的名称(若不填则无法显示该图的说明)'
                                        value={value.name}
                                        onChange={(e)=>{this.updateName(e,index)}}
                                    />
                                </Input.Group>
                                <TextArea
                                    rows={3}
                                    placeholder={this.showPlaceholder(value.type)}
                                    value={value.data}
                                    onChange={(e)=>{this.updateOneData(e, index)}}
                                />
                            </div>
                        )
                    })
                }
                <Button type='primary' block onClick={this.addStatistic}>添加图形</Button>
            </div>
        );
    }
}

EdtStatistic.showTitle='统计图';

export default EdtStatistic;