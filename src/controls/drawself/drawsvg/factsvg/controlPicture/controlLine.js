import {OnePicture} from '../onePicture.js';

import {MovePic} from '../factPictures/movePicture.js'
import {LinePic} from '../factPictures/linePicture.js'

import {Point} from "../point";

import {Input, Button, InputNumber} from "antd";
import React from "react";
//继承OnePicture
function ControlLine(picArray, style, pointArray) {
    OnePicture.call(this, picArray, false, style, pointArray);
    this.picname='line';
    this.controlNum = 2;
}
ControlLine.prototype = new OnePicture();
ControlLine.prototype.constructor = ControlLine;

//重写必须要重写的方法
ControlLine.prototype.afterSetPoint = function (pointArray) {
    if (!pointArray || !pointArray.length)
        return;
    this.appendOne(new MovePic([pointArray[0].x, pointArray[0].y]));
    if (pointArray.length >= this.controlNum){
        this.appendOne(new LinePic([pointArray[1].x, pointArray[1].y]));
    }
};
ControlLine.prototype.afterAddPoint = function (point, index) {
    if (index === 0){
        this.appendOne(new MovePic([point.x, point.y]), index);
    }
    else if (index === 1){
        this.appendOne(new LinePic([point.x, point.y]), index);
    }
    else if (this.pointArray.length === 1){
        this.appendOne(new MovePic([point.x, point.y]));
    }
    else if (this.pointArray.length === this.controlNum){
        this.appendOne(new LinePic([point.x, point.y]));
    }
    else if (this.pointArray.length > this.controlNum){
        let newx = this.pointArray[1].x*point.extra.bi+this.pointArray[0].x*(1-point.extra.bi);
        let newy = this.pointArray[1].y*point.extra.bi+this.pointArray[0].y*(1-point.extra.bi);
        point.x = newx;
        point.y = newy;
    }
};
ControlLine.prototype.afterChangePoint = function (point, picArray) {
    let thisIndex = picArray.indexOf(this);
    let flag = false;//用于表示该点是控制点还是附属点,false表示附属点
    //判断改变的这个点是该图形的控制点还是附属点
    point.control.forEach(item=>{
        if (item.arrin!==thisIndex){
            return;
        }
        if (item.pic < this.controlNum){
            this.picArray[item.pic].setParameter([point.x,point.y]);
            flag = true;
        }
    });
    if (!flag) //若改变的是这个图形的附属点，，则该图形不会变化，则不需要改变其他附属点的位置
        return;
    this.pointArray.forEach((value,index)=>{
        if (index < this.controlNum)
            return;
        let newx = this.pointArray[1].x*value.extra.bi+this.pointArray[0].x*(1-value.extra.bi);
        let newy = this.pointArray[1].y*value.extra.bi+this.pointArray[0].y*(1-value.extra.bi);
        value.changeLocation(newx, newy, picArray);
    });
};
ControlLine.prototype.updatePic = function () {
    this.picArray[0].setParameter([this.pointArray[0].x,this.pointArray[0].y]);
    this.picArray[1].setParameter([this.pointArray[1].x,this.pointArray[1].y]);
};

ControlLine.prototype.showEdit = function (picArray, pointArray, callback, updateShow) {
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
    //添加附加点
    const addpoint = () =>{
        let thisIndex = picArray.indexOf(this);
        let p = new Point(this.pointArray[0].x, this.pointArray[0].y, [{arrin:thisIndex, pic:this.pointArray.length}], {arrin:thisIndex, bi:0});
        this.addPoint(p);
        pointArray.push(p);
        callback();
        updateShow();
    };
    //改变附加点的位置
    const changebi = (e, item)=>{
        if (e == item.extra.bi)
            return;
        e = e||0;
        e = e<0?0:e;
        e = e>1?1:e;
        let newx = this.pointArray[1].x*e+this.pointArray[0].x*(1-e);
        let newy = this.pointArray[1].y*e+this.pointArray[0].y*(1-e);
        item.extra.bi = e;
        item.changeLocation(newx, newy, picArray);
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
            {
                this.pointArray.map((item, i)=>{
                    return (
                        i<this.controlNum?
                            <div className='edit-one' key={i}>
                                <span>点{i+1}: x:</span>
                                <Input size='small' disabled={!!item.extra} defaultValue={item.x} type='number' onChange={(e)=>{changeX(e, item)}}/>
                                <span>y:</span>
                                <Input size='small' disabled={!!item.extra} defaultValue={item.y} type='number' onChange={(e)=>{changeY(e, item)}}/>
                            </div>
                            :
                            <div className='edit-one' key={i}>
                                <span>点{i+1}: 位置:</span>
                                <InputNumber
                                    min={0}
                                    max={1}
                                    size='small'
                                    step={0.01}
                                    defaultValue={item.extra.bi}
                                    onChange={(e)=>{changebi(e, item)}}
                                />
                            </div>

                    )
                })
            }
            <Button size='small' type='primary' block onClick={addpoint}>添加附属点</Button>
        </div>
    )
};

export {ControlLine};