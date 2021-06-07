import React from 'react';
import './index.css';

import { Select, Input, Switch, Button, Upload, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

class EdtCarousel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            style:{bili:2},
            option:{},
            dataArray:[]
        }
    }
    componentDidMount(){
        if (this.props.data && this.props.data.cpdata){
            this.setState({
                style:this.props.data.cpdata.style?{...this.props.data.cpdata.style}:{bili:2},
                dataArray:this.props.data.cpdata.dataArray?[...this.props.data.cpdata.dataArray]:[],
                option:this.props.data.cpdata.option?{...this.props.data.cpdata.option}:{},
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
    //改变样式
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
    updateBili = (e)=>{
        if (e.target.value === ''){
            this.setState({
                style:{...this.state.style, bili:null}
            });
            this.updateStyle({...this.state.style, bili:''});
        }
        else if (/^\d+(\.\d+)?$/.test(e.target.value)){
            let style = {...this.state.style, bili:parseFloat(e.target.value)};
            this.setState({
                style
            });
            this.updateStyle(style);
        }
    };
    //修改选项值
    updateOption = (option)=>{
        this.updateData({cpdata:{...this.props.data.cpdata ,option}});
    };
    updateShowPoint = (e)=>{
        let option = {...this.state.option,showPoint:e};
        this.setState({
            option
        });
        this.updateOption(option);
    };
    updateShowMove = (e)=>{
        let option = {...this.state.option,showMove:e};
        this.setState({
            option
        });
        this.updateOption(option);
    };
    updateAutoCircular = (e)=>{
        if (e){
            let option = {...this.state.option,autoCircular:{}};
            this.setState({
                option
            });
            this.updateOption(option);
        }
        else{
            this.deleteOptionKeys(['autoCircular']);
        }
    };
    updateAutoCircularTime = (e)=>{
        if (e.target.value === ''){
            let option = {...this.state.option,autoCircular:{}};
            this.setState({
                option,
            });
            this.updateOption(option);
        }
        else if (/^\d+$/.test(e.target.value)){
            let option = {...this.state.option, autoCircular:{time:parseInt(e.target.value)}};
            this.setState({
                option
            });
            this.updateOption(option);
        }
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
    updateDataArray = (dataArray)=>{
        this.updateData({cpdata:{...this.props.data.cpdata ,dataArray}});
    };
    //增加图形
    addSlide = ()=>{
        let dataArray = [...this.state.dataArray, {}];
        this.setState({
            dataArray
        });
        this.updateDataArray(dataArray);
    };
    updateBgColor = (e, index)=>{
        let newItem = {...this.state.dataArray[index], bgColor:e.target.value};
        this.updateDataArrayItems(newItem, index);
    };
    updateTextColor = (e, index)=>{
        let newItem = {...this.state.dataArray[index], textColor:e.target.value};
        this.updateDataArrayItems(newItem, index);
    };
    updateTextMarginTop = (e, index)=>{
        if (e.target.value === ''){
            this.setState({
                dataArray:[...this.state.dataArray.slice(0,index),{...this.state.dataArray[index], marginTop:null},...this.state.dataArray.slice(index+1)]
            });
            this.updateDataArray([...this.state.dataArray.slice(0,index),{...this.state.dataArray[index], marginTop:''},...this.state.dataArray.slice(index+1)]);
        }
        else if (/^\d+$/.test(e.target.value)){
            let newItem = {...this.state.dataArray[index], marginTop:parseInt(e.target.value)};
            this.updateDataArrayItems(newItem, index);
        }
    };
    updateOneText = (e, index)=>{
        let newItem = {...this.state.dataArray[index], text:e.target.value};
        this.updateDataArrayItems(newItem, index);
    };
    updateBackgroundImage = (e, index)=>{
        let file = e.file;
        if (file.status === 'done') {
            let path = '/'+file.response.path.replace(/\\/g,'/');
            let newItem = {...this.state.dataArray[index], backgroundImage:{name:file.name,uid:file.uid,path}};
            this.updateDataArrayItems(newItem, index);
        }
        else if (file.status === 'removed'){
            let newItem = {...this.state.dataArray[index], backgroundImage:null};
            this.updateDataArrayItems(newItem, index);
        }
        else {
            let newItem = {...this.state.dataArray[index], backgroundImage:file};
            this.setState({
                dataArray:[...this.state.dataArray.slice(0,index),newItem,...this.state.dataArray.slice(index+1)]
            });
        }
    };
    updateDataArrayItems = (newItem, index)=>{
        let dataArray = [...this.state.dataArray.slice(0,index),newItem,...this.state.dataArray.slice(index+1)];
        this.setState({
            dataArray
        });
        this.updateDataArray(dataArray);
    };
    //删除图形
    deleteSlide = (index)=>{
        let dataArray = [...this.state.dataArray.slice(0,index), ...this.state.dataArray.slice(index+1)];
        this.setState({
            dataArray
        });
        this.updateDataArray(dataArray);
    };
    render() {
        return (
            <div className='carousel-edt-box'>
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
                        placeholder='轮播的宽(px)'
                        type='number'
                        value={this.state.style.width}
                        onChange={this.updateWidth}
                    />
                    <Input
                        placeholder='轮播的宽高比'
                        type='number'
                        value={this.state.style.bili}
                        onChange={this.updateBili}
                    />
                </Input.Group>
                <div className='carousel-edt-switch-box'>
                    <div>
                        <span>指示点：</span>
                        <Switch
                            checkedChildren="显示"
                            unCheckedChildren="隐藏"
                            checked={this.state.option.showPoint}
                            onChange={this.updateShowPoint}
                        />
                    </div>
                    <div>
                        <span>左右按钮：</span>
                        <Switch
                            checkedChildren="显示"
                            unCheckedChildren="隐藏"
                            checked={this.state.option.showMove}
                            onChange={this.updateShowMove}
                        />
                    </div>
                    <div>
                        <span>自动轮播：</span>
                        <Switch
                            checkedChildren="显示"
                            unCheckedChildren="隐藏"
                            checked={this.state.option.autoCircular}
                            onChange={this.updateAutoCircular}
                        />
                    </div>
                </div>
                {
                    this.state.option.autoCircular &&
                    <Input
                        placeholder='自动轮播的间隔时间(默认5000ms)'
                        type='number'
                        value={this.state.option.autoCircular.time}
                        onChange={this.updateAutoCircularTime}
                    />
                }
                {
                    this.state.dataArray.map((value,index)=>{
                        return (
                            <div className='carousel-edt-one' key={index}>
                                <div className='one-title'>
                                    <Title level={5}>第{index+1}部分：</Title>
                                    <Button type='danger' size='small' onClick={()=>{this.deleteSlide(index)}}>删除该部分</Button>
                                </div>
                                <div className='one-row'>
                                    <div>
                                        <span>背景颜色：</span>
                                        <Input
                                            type='color'
                                            value={value.bgColor||'#ffffff'}
                                            onChange={(e)=>{this.updateBgColor(e,index)}}
                                            style={{width:50, padding:'2px 5px'}}
                                        />
                                    </div>
                                    <div>
                                        <span>文字颜色：</span>
                                        <Input
                                            type='color'
                                            value={value.textColor||'#000000'}
                                            onChange={(e)=>{this.updateTextColor(e,index)}}
                                            style={{width:50, padding:'2px 5px'}}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            placeholder='文字距离顶部(px)'
                                            type='number'
                                            value={value.marginTop}
                                            onChange={(e)=>{this.updateTextMarginTop(e,index)}}
                                        />
                                    </div>
                                </div>
                                <TextArea
                                    rows={3}
                                    placeholder='请输入显示的文字'
                                    value={value.text}
                                    onChange={(e)=>{this.updateOneText(e, index)}}
                                />
                                <div style={{margin:'5px 0'}}>
                                    <label>背景图片：</label>
                                    <Upload
                                        action="/api/images"
                                        accept='/image/*'
                                        fileList={value.backgroundImage?[value.backgroundImage]:[]}
                                        onChange={(e)=>{this.updateBackgroundImage(e,index)}}
                                    >
                                        <Button icon={<UploadOutlined />}>上传图片</Button>
                                    </Upload>
                                </div>
                            </div>
                        )
                    })
                }
                <Button type='primary' block onClick={this.addSlide}>添加滑块</Button>
            </div>
        );
    }
}

EdtCarousel.showTitle = '轮播';

export default EdtCarousel;