import React from 'react';
import './index.css';

import DrawSvg from '../drawsvg'

class EdtDrawSelf extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pictureArray:this.props.data.cpdata && this.props.data.cpdata.pictureArray,
            pointArray:this.props.data.cpdata && this.props.data.cpdata.pointArray,
            backgroundColor:(this.props.data.cpdata && this.props.data.cpdata.backgroundColor)||'#ffffff',
            height:(this.props.data.cpdata && this.props.data.cpdata.height)||500,
        }
    }
    //修改内容
    updateContent = (pictureArray, pointArray)=>{
        this.updateData({cpdata:{...this.props.data.cpdata, pictureArray, pointArray}});
    };
    //修改背景颜色
    updateBgc = (bgc)=>{
        this.updateData({cpdata:{...this.props.data.cpdata, backgroundColor:bgc}});
    };
    //修改画布的高
    changeHeight = (height)=>{
        this.updateData({cpdata:{...this.props.data.cpdata, height}});
    };

    updateData = (newdata)=>{
        this.props.updateData &&
        this.props.updateData(this.props.index, {
            ...this.props.data,
            ...newdata
        });
    };
    render(){
        return(
            <DrawSvg
                onChange={this.updateContent}
                changeBgc={this.updateBgc}
                changeHeight={this.changeHeight}
                pictureArray={this.state.pictureArray}
                pointArray={this.state.pointArray}
                backgroundColor={this.state.backgroundColor}
                height={this.state.height}
            />
        );
    }
}

EdtDrawSelf.showTitle='画图';

export default EdtDrawSelf;