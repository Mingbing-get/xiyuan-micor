import {OnePicture} from '../onePicture.js';

import {MovePic} from '../factPictures/movePicture.js'
import {LinePic} from '../factPictures/linePicture.js'
import {Input, InputNumber, Slider} from "antd";
import React from "react";
//继承OnePicture
function ControlLineSnow(picArray, style, pointArray) {
    OnePicture.call(this, picArray, false, style, pointArray);
    this.picname='linesnow';
    this.controlNum = 2;
    this.theta = 2;//表示雪花递归的深度
}
ControlLineSnow.prototype = new OnePicture();
ControlLineSnow.prototype.constructor = ControlLineSnow;

//重写必须要重写的方法
ControlLineSnow.prototype.afterSetPoint = function (pointArray) {
    if (!pointArray || !pointArray.length)
        return;
    if (pointArray.length >= this.controlNum){
        this.drawSnow();
    }
};
ControlLineSnow.prototype.afterAddPoint = function (point, index) {
    if (this.notEmptyLength(this.pointArray) === this.controlNum){
        this.drawSnow();
    }
};
ControlLineSnow.prototype.afterChangePoint = function (point, picArray) {
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
ControlLineSnow.prototype.updatePic = function () {
    this.clearpic();
    this.drawSnow();
};

ControlLineSnow.prototype.showEdit = function (picArray, pointArray, callback, updateShow) {
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
    return (
        <div className='edit-box'>
            <div className='edit-one'>
                <span>线的宽:</span>
                <InputNumber min={0} size='small' step={1} defaultValue={this.style.strokeWidth===0?0:(this.style.strokeWidth||1)} onChange={changeStrokeWidth}/>
                <span>线的颜色:</span>
                <Input size='small' type='color' defaultValue={this.style.stroke} onChange={changeStroke}/>
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
ControlLineSnow.prototype.drawSnow = function (theta) {
    theta = theta || this.theta;
    const r = Math.sqrt(Math.pow(this.pointArray[0].x-this.pointArray[1].x, 2)+Math.pow(this.pointArray[0].y-this.pointArray[1].y, 2));
    const cs_t = r===0?0:(this.pointArray[1].x-this.pointArray[0].x)/r;
    const si_t = r===0?0:(this.pointArray[1].y-this.pointArray[0].y)/r;
    for (let i = 0; i < 6; i++){
        let cs_i = Math.cos(i/3*Math.PI);
        let si_i = Math.sin(i/3*Math.PI);
        let x = r*(cs_t*cs_i-si_t*si_i)+this.pointArray[0].x;
        let y = r*(si_t*cs_i+cs_t*si_i)+this.pointArray[0].y;
        this.appendOne(new MovePic([this.pointArray[0].x,this.pointArray[0].y]));
        this.appendOne(new LinePic([x,y]));
        this.drawLine(this.pointArray[0].x,this.pointArray[0].y, x,y, theta);
    }
};
//对每一条线分形
ControlLineSnow.prototype.drawLine = function (x1,y1,x2,y2,n) {
    if (n === 0){
        return;
    }
    let centerx = (x1+x2)/2;
    let centery = (y1+y2)/2;
    let r = Math.sqrt(Math.pow(x1-x2, 2)+Math.pow(y1-y2, 2))/3;
    const cs_t = r===0?0:(x2-centerx)/r*2/3;
    const si_t = r===0?0:(y2-centery)/r*2/3;
    const cs_60 = Math.cos(1/3*Math.PI);
    const si_60 = Math.sin(1/3*Math.PI);
    let x3 = r*(cs_t*cs_60-si_t*si_60)+centerx;
    let y3 = r*(si_t*cs_60+cs_t*si_60)+centery;
    let x4 = r*(cs_t*cs_60+si_t*si_60)+centerx;
    let y4 = r*(si_t*cs_60-cs_t*si_60)+centery;
    this.appendOne(new MovePic([centerx,centery]));
    this.appendOne(new LinePic([x3,y3]));
    this.appendOne(new MovePic([centerx,centery]));
    this.appendOne(new LinePic([x4,y4]));
    this.drawLine(x1,y1,centerx,centery,n-1);
    this.drawLine(centerx,centery,x2,y2,n-1);
    this.drawLine(centerx,centery,x3,y3,n-1);
    this.drawLine(centerx,centery,x4,y4,n-1);
};

export {ControlLineSnow};