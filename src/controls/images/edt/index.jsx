import React from 'react';
import './index.css';

import { Upload, Modal, Input, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

class EdtImages extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fileList:[],
            style:{},
            previewVisible:false,
            previewImage:null,
            title:'',
            discription:''
        }
    }

    componentDidMount(){
        if (this.props.data && this.props.data.cpdata){
            if (this.props.data.cpdata.path){
                let fileList = [];
                this.props.data.cpdata.path.forEach((value,index)=>{
                    let temp = {};
                    temp.uid = 'pre'+index;
                    temp.status = 'done';
                    temp.url = value;
                    fileList.push(temp);
                });
                this.setState({
                    fileList
                });
            }
            if (this.props.data.cpdata.style){
                this.setState({
                    style:{...this.props.data.cpdata.style}
                });
            }
            this.setState({
                title:this.props.data.cpdata.title||'',
                discription:this.props.data.cpdata.discription||''
            });
        }
    };

    //添加一个图片
    updatePath = (path)=>{
        let prepath = (this.props.data.cpdata && this.props.data.cpdata.path) || [];
        this.updateData({cpdata:{...this.props.data.cpdata ,path:[...prepath, path]}});
    };
    //删除一个图片
    deletePath = (path)=>{
        let prepath = (this.props.data.cpdata && this.props.data.cpdata.path) || [];
        let index = prepath.findIndex(v=>v===path);
        let nowpath = [];
        if (index !== -1){
            nowpath = [...this.props.data.cpdata.path.slice(0,index), ...this.props.data.cpdata.path.slice(index+1)];
        }
        this.updateData({cpdata:{...this.props.data.cpdata ,path:nowpath}});
    };

    //修改样式
    updateStyle = (style)=>{
        this.updateData({cpdata:{...this.props.data.cpdata ,style}});
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
    updateRadius = (e)=>{
        if (e.target.value === ''){
            this.setState({
                style:{...this.state.style, radius:null}
            });
            this.updateStyle({...this.state.style, radius:''});
        }
        else if (/^\d+$/.test(e.target.value)){
            let style = {...this.state.style, radius:parseInt(e.target.value)};
            this.setState({
                style
            });
            this.updateStyle(style);
        }
    };
    updateJustify = (e)=>{
        let style = {...this.state.style, justify:e};
        this.setState({
            style
        });
        this.updateStyle(style);
    };

    //修改标题
    updateTitle = (e)=>{
        this.setState({
            title:e.target.value
        });
        this.updateData({cpdata:{...this.props.data.cpdata ,title:e.target.value}});
    };
    //修改描述
    updateDiscription = (e)=>{
        this.setState({
            discription:e.target.value
        });
        this.updateData({cpdata:{...this.props.data.cpdata ,discription:e.target.value}});
    };

    updateData = (newdata)=>{
        this.props.updateData &&
        this.props.updateData(this.props.index, {
            ...this.props.data,
            ...newdata
        });
    };

    //查看图片详图
    handlePreview = (e)=>{
        let url = e.url;
        if (e.response && e.response.status === 1)
            url = '/'+e.response.path.replace(/\\/g, '/');
        this.setState({
            previewVisible:true,
            previewImage:url
        });
    };

    //图片有增删
    handleChange = (e) => {
        let fileList = e.fileList;
        if (e.file.status === "removed") {
            //表示删除图片
            let url = e.file.url;
            if (e.file.response && e.file.response.status === 1)
                url = '/'+e.file.response.path.replace(/\\/g, '/');
            this.deletePath(url);
        }
        else if (fileList[fileList.length-1].status === 'done')
            this.updatePath('/'+fileList[fileList.length-1].response.path.replace(/\\/g,'/'));
        this.setState({
            fileList
        });
    };

    modalCancel = ()=>{
        this.setState({
            previewVisible: false
        });
    };
    render() {
        return (
            <div className='image-edt-box'>
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
                    <Input
                        placeholder='图片的宽(px)'
                        type='number'
                        value={this.state.style.width}
                        onChange={this.updateWidth}
                    />
                    <Input
                        placeholder='圆角(px)'
                        type='number'
                        value={this.state.style.radius}
                        onChange={this.updateRadius}
                    />
                </Input.Group>
                <Input
                    placeholder="图片标题"
                    value={this.state.title}
                    onChange={this.updateTitle}
                />
                <Input
                    placeholder="图片描述"
                    value={this.state.discription}
                    onChange={this.updateDiscription}
                />
                <Upload
                    action="/api/images"
                    listType="picture-card"
                    fileList={this.state.fileList}
                    onPreview={this.handlePreview}
                    onChange={this.handleChange}
                >
                    <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>上传</div>
                    </div>
                </Upload>
                <Modal
                    visible={this.state.previewVisible}
                    title='图片预览'
                    footer={null}
                    onCancel={this.modalCancel}
                >
                    <img alt="example" style={{ width: '100%' }} src={this.state.previewImage} />
                </Modal>
            </div>
        );
    }
}

EdtImages.showTitle = '图片';

export default EdtImages;