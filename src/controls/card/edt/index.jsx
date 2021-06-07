import React from 'react';
import './index.css';

import { Select, Input, Button, Upload, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

class EdtCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            style:{},
            cards:[]
        }
    }
    componentDidMount(){
        if (this.props.data && this.props.data.cpdata){
            this.setState({
                style:this.props.data.cpdata.style?{...this.props.data.cpdata.style}:{},
                cards:this.props.data.cpdata.cards?[...this.props.data.cpdata.cards]:[],
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
    updateBorder = (e)=>{
        let style = {...this.state.style, border:e};
        this.setState({
            style
        });
        this.updateStyle(style);
    };
    updateHoverable = (e)=>{
        let style = {...this.state.style, hoverable:e};
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
    //添加一个卡片
    addCard = ()=>{
        let cards = [...this.state.cards,{}];
        this.setState({
            cards
        });
        this.updateCard(cards);
    };
    //设置卡片内容
    updateCard = (cards)=>{
        this.updateData({cpdata:{...this.props.data.cpdata ,cards}});
    };
    updateTitle = (e,index)=>{
        let newCard = {...this.state.cards[index], title:e.target.value};
        this.updateCards(newCard, index);
    };
    updateSubTitle = (e,index)=>{
        let newCard = {...this.state.cards[index], subTitle:e.target.value};
        this.updateCards(newCard, index);
    };
    updateDiscription = (e,index)=>{
        let newCard = {...this.state.cards[index], discription:e.target.value};
        this.updateCards(newCard, index);
    };
    updateContent = (e,index)=>{
        let newCard = {...this.state.cards[index], content:e.target.value};
        this.updateCards(newCard, index);
    };
    updateCover = (e, index)=>{
        let file = e.file;
        if (file.status === 'done') {
            let path = '/'+file.response.path.replace(/\\/g,'/');
            let newCard = {...this.state.cards[index], cover:{name:file.name,uid:file.uid,path}};
            this.updateCards(newCard, index);
        }
        else if (file.status === 'removed'){
            let newCard = {...this.state.cards[index], cover:null};
            this.updateCards(newCard, index);
        }
        else {
            let newCard = {...this.state.cards[index], cover:file};
            this.setState({
                cards:[...this.state.cards.slice(0,index),newCard,...this.state.cards.slice(index+1)]
            });
        }
    };
    updateCards = (newCard, index)=>{
        let cards = [...this.state.cards.slice(0,index),newCard,...this.state.cards.slice(index+1)];
        this.setState({
            cards
        });
        this.updateCard(cards);
    };
    //删除一个卡片
    deleteCard = (index)=>{
        let cards = [...this.state.cards.slice(0,index), ...this.state.cards.slice(index+1)];
        this.setState({
            cards
        });
        this.updateCard(cards);
    };
    render() {
        return (
            <div className='card-edt-box'>
                <Title level={5} style={{marginBottom:0}}>基本配置：</Title>
                <Input.Group compact>
                    <Select
                        value={this.state.style.justify||'space-around'}
                        onChange={this.updateJustify}
                    >
                        <Option value="space-around">默认</Option>
                        <Option value="space-between">等间距</Option>
                        <Option value="flex-start">左对齐</Option>
                        <Option value="center">居中</Option>
                        <Option value="flex-end">右对齐</Option>
                    </Select>
                    <Select
                        value={this.state.style.border||'border'}
                        onChange={this.updateBorder}
                    >
                        <Option value="border">有边框</Option>
                        <Option value="no-border">无边框</Option>
                    </Select>
                    <Select
                        value={this.state.style.hoverable||'hoverable'}
                        onChange={this.updateHoverable}
                    >
                        <Option value="hoverable">浮动</Option>
                        <Option value="no-hoverable">不浮动</Option>
                    </Select>
                    <Input
                        placeholder='卡片的宽(px)'
                        type='number'
                        value={this.state.style.width}
                        onChange={this.updateWidth}
                    />
                </Input.Group>
                {
                    this.state.cards.map((value,index)=>{
                        return (
                            <div className='card-one-box' key={index}>
                                <div className='card-one-title'>
                                    <Title level={5}>卡片{index+1}：</Title>
                                    <Button
                                        type='danger'
                                        size='small'
                                        onClick={()=>{this.deleteCard(index)}}
                                    >删除该卡片</Button>
                                </div>
                                <label>
                                    标题：
                                    <Input
                                        placeholder='卡片的标题'
                                        value={value.title}
                                        onChange={(e)=>{this.updateTitle(e,index)}}
                                    />
                                </label>
                                <label>
                                    副标题：
                                    <Input
                                        placeholder='卡片的副标题'
                                        value={value.subTitle}
                                        onChange={(e)=>{this.updateSubTitle(e,index)}}
                                    />
                                </label>
                                <label>
                                    描述：
                                    <Input
                                        placeholder='卡片的描述'
                                        value={value.discription}
                                        onChange={(e)=>{this.updateDiscription(e,index)}}
                                    />
                                </label>
                                <label>
                                    内容：
                                    <TextArea
                                        rows={2}
                                        placeholder='卡片的内容'
                                        value={value.content}
                                        onChange={(e)=>{this.updateContent(e,index)}}
                                    />
                                </label>
                                <div style={{margin:'5px 0'}}>
                                    <label>封面：</label>
                                    <Upload
                                        action="/api/images"
                                        accept='/image/*'
                                        fileList={value.cover?[value.cover]:[]}
                                        onChange={(e)=>{this.updateCover(e,index)}}
                                    >
                                        <Button icon={<UploadOutlined />}>上传图片</Button>
                                    </Upload>
                                </div>
                            </div>
                        )
                    })
                }
                <Button
                    type='primary'
                    block
                    onClick={this.addCard}
                >添加卡片</Button>
            </div>
        );
    }
}

EdtCard.showTitle = '卡片';

export default EdtCard;