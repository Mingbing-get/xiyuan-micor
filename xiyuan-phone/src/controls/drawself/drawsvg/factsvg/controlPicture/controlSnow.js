import {OnePicture} from '../onePicture.js';

import {MovePic} from '../factPictures/movePicture.js'
import {LinePic} from '../factPictures/linePicture.js'
import {Input, InputNumber, Slider} from "antd";
import React from "react";
//继承OnePicture
function ControlSnow(picArray, style, pointArray) {
    OnePicture.call(this, picArray, true, style, pointArray);
    this.picname='snow';
    this.controlNum = 2;
    this.theta = 2;//表示雪花递归的深度
}
ControlSnow.prototype = new OnePicture();
ControlSnow.prototype.constructor = ControlSnow;

//重写必须要重写的方法
ControlSnow.prototype.afterSetPoint = function (pointArray) {
    if (!pointArray || !pointArray.length)
        return;
    if (pointArray.length >= this.controlNum){
        this.drawSnow();
    }
};
ControlSnow.prototype.afterAddPoint = function (point, index) {
    if (this.notEmptyLength(this.pointArray) === this.controlNum){
        this.drawSnow();
    }
};
ControlSnow.prototype.afterChangePoint = function (point, picArray) {
    let thisIndex = picArray.indexOf(this);
    //判断改变的这个点是该图形的控制点还是附属点
    point.control.forEach(item=>{
        if (item.arrin!==thisIndex){
            return;
        }
        if (item.pic < this.controlNum){
            this.updatePic();
        }
    });
};
ControlSnow.prototype.updatePic = function () {
    this.clearpic();
    this.drawSnow();
};

ControlSnow.prototype.showEdit = function (picArray, pointArray, callback, updateShow) {
    //输入x的坐标
    function changeX(e, item) {
        item.changeLocation(parseInt(e.target.value||0), item.y, picArray);
        callback();
    }
    //输入y的坐标
    function changeY(e, item) {
        item.changeLocation(item.x, parseInt(e.target.value||0), picArray);
        callback();
    }
    //输入分支的深度
    const changeSnowTheta = (e)=>{
        if (e == this.theta)
            return;
        e = e||2;
        e = e<2?2:e;
        e = e>8?8:e;
        this.clearpic();
        this.drawSnow(e);
        this.theta = e;
        callback();
    };
    //改变线的宽度
    const changeStrokeWidth = (e)=>{
        let width = parseInt(e)||0;
        this.style.strokeWidth = width<0?0:width;
        callback();
    };
    //改变线的颜色
    const changeStroke = (e)=>{
        this.style.stroke = e.target.value;
        callback();
    };
    //改变填充颜色
    const changeFill = (e)=>{
        let arfa = this.style.arfa||0;
        this.style.fill = e.target.value+arfa.toString(16);
        callback();
    };
    //改变填充色的透明度
    const changeArfa = (e)=>{
        this.style.fill = this.style.fill.substring(0,7)+e.toString(16);
        this.style.arfa = e;
        callback();
    };
    return (
        <div className='edit-box'>
            <div className='edit-one'>
                <span>线的宽:</span>
                <InputNumber min={0} size='small' step={1} defaultValue={this.style.strokeWidth===0?0:(this.style.strokeWidth||1)} onChange={changeStrokeWidth}/>
                <span>线的颜色:</span>
                <Input size='small' type='color' defaultValue={this.style.stroke} onChange={changeStroke}/>
            </div>
            <div className='edit-one'>
                <span>填充颜色:</span>
                <Input size='small' type='color' defaultValue={this.style.fill.substring(0,7)} onChange={changeFill}/>
                <span>透明度:</span>
                <Slider min={0} max={255} defaultValue={this.style.arfa||0} tooltipVisible onChange={changeArfa} />
            </div>
            <div className='edit-one'>
                <span>分支深度: </span>
                <InputNumber size='small' step={1}  min={2} max={8} defaultValue={this.theta} onChange={changeSnowTheta}/>
            </div>
            {
                this.pointArray.map((item, i)=>{
                    return (
                        i<this.controlNum&&
                            <div className='edit-one' key={i}>
                                <span>点{i+1}: x:</span>
                                <Input size='small' disabled={!!item.extra} defaultValue={item.x} type='number' onChange={(e)=>{changeX(e, item)}}/>
                                <span>y:</span>
                                <Input size='small' disabled={!!item.extra} defaultValue={item.y} type='number' onChange={(e)=>{changeY(e, item)}}/>
                            </div>
                    )
                })
            }
        </div>
    )
};
//自己新增的方法
ControlSnow.prototype.drawSnow = function (theta) {
    theta = theta || this.theta;
    const r = Math.sqrt(Math.pow(this.pointArray[0].x-this.pointArray[1].x, 2)+Math.pow(this.pointArray[0].y-this.pointArray[1].y, 2));
    const cs_t = r===0?0:(this.pointArray[1].x-this.pointArray[0].x)/r;
    const si_t = r===0?0:(this.pointArray[1].y-this.pointArray[0].y)/r;
    const cs_120 = Math.cos(2/3*Math.PI);
    const si_120 = Math.sin(2/3*Math.PI);
    let x1 = r*(cs_t*cs_120-si_t*si_120)+this.pointArray[0].x;
    let y1 = r*(si_t*cs_120+cs_t*si_120)+this.pointArray[0].y;
    let x2 = r*(cs_t*cs_120+si_t*si_120)+this.pointArray[0].x;
    let y2 = r*(si_t*cs_120-cs_t*si_120)+this.pointArray[0].y;
    //先将笔移动到起始点
    this.appendOne(new MovePic([this.pointArray[1].x,this.pointArray[1].y]));
    //再一次调用递归方法画出每一条线
    this.drawLine(this.pointArray[1].x,this.pointArray[1].y,x1,y1,theta);
    this.drawLine(x1,y1,x2,y2,theta);
    this.drawLine(x2,y2,this.pointArray[1].x,this.pointArray[1].y,theta);
};
//对每一条线分形
ControlSnow.prototype.drawLine = function (x1,y1,x2,y2,n) {
    if (n === 0){
        this.appendOne(new LinePic([x2,y2]));
        return;
    }
    let x3 = 2/3*x1+1/3*x2;
    let y3 = 2/3*y1+1/3*y2;
    let x4 = 1/3*x1+2/3*x2;
    let y4 = 1/3*y1+2/3*y2;
    const r = Math.sqrt(Math.pow(x1-x2, 2)+Math.pow(y1-y2, 2))/3;
    const cs_t = r===0?0:(x1-x3)/r;
    const si_t = r===0?0:(y1-y3)/r;
    const cs_120 = Math.cos(2/3*Math.PI);
    const si_120 = Math.sin(2/3*Math.PI);
    let x5 = r*(cs_t*cs_120-si_t*si_120)+x3;
    let y5 = r*(si_t*cs_120+cs_t*si_120)+y3;
    this.drawLine(x1,y1,x3,y3, n-1);
    this.drawLine(x3,y3,x5,y5, n-1);
    this.drawLine(x5,y5,x4,y4, n-1);
    this.drawLine(x4,y4,x2,y2, n-1);
};

export {ControlSnow};