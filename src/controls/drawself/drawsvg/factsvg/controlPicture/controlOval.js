import {OnePicture} from '../onePicture.js';

import {MovePic} from '../factPictures/movePicture.js'
import {ArcPic} from '../factPictures/arcPicture.js'
import {Input, InputNumber, Slider} from "antd";
import React from "react";
//继承OnePicture
function ControlOval(picArray, style, pointArray, theta) {
    OnePicture.call(this, picArray, false, style, pointArray);
    this.picname='oval';
    this.theta = theta || 0;
    this.controlNum = 2;
}
ControlOval.prototype = new OnePicture();
ControlOval.prototype.constructor = ControlOval;

//重写必须要重写的方法
ControlOval.prototype.afterSetPoint = function (pointArray) {
    if (!pointArray || !pointArray.length)
        return;
    if (pointArray.length >= this.controlNum){
        let xcha = this.pointArray[0].x-this.pointArray[1].x;
        let ycha = this.pointArray[0].y-this.pointArray[1].y;
        let a = Math.abs(xcha);
        let b = Math.abs(ycha);
        let fx = xcha*ycha>0?1:0;
        this.appendOne(new MovePic([this.pointArray[0].x, this.pointArray[0].y]));
        this.appendOne(new ArcPic([a,b,this.theta,fx,0,this.pointArray[1].x, this.pointArray[1].y]));
        this.appendOne(new ArcPic([a,b,this.theta,fx?0:1,0,this.pointArray[0].x, this.pointArray[0].y]));
    }
};
ControlOval.prototype.afterAddPoint = function (point, index) {
    if (this.notEmptyLength(this.pointArray) === this.controlNum){
        let xcha = this.pointArray[0].x-this.pointArray[1].x;
        let ycha = this.pointArray[0].y-this.pointArray[1].y;
        let a = Math.abs(xcha);
        let b = Math.abs(ycha);
        let fx = xcha*ycha>0?1:0;
        this.appendOne(new MovePic([this.pointArray[0].x, this.pointArray[0].y]));
        this.appendOne(new ArcPic([a,b,this.theta,fx,0,this.pointArray[1].x, this.pointArray[1].y]));
        this.appendOne(new ArcPic([a,b,this.theta,fx?0:1,0,this.pointArray[0].x, this.pointArray[0].y]));
    }
};
ControlOval.prototype.afterChangePoint = function (point, picArray) {
    let thisIndex = picArray.indexOf(this);
    //判断改变的这个点是该图形的控制点还是附属点
    point.control.forEach(item=>{
        if (item.arrin!==thisIndex){
            return;
        }
        if (item.pic < this.controlNum){
            let xcha = this.pointArray[0].x-this.pointArray[1].x;
            let ycha = this.pointArray[0].y-this.pointArray[1].y;
            let a = Math.abs(xcha);
            let b = Math.abs(ycha);
            let fx = xcha*ycha>0?1:0;
            this.picArray[0].setParameter([this.pointArray[0].x, this.pointArray[0].y]);
            this.picArray[1].setParameter([a,b,this.theta,fx,0,this.pointArray[1].x, this.pointArray[1].y]);
            this.picArray[2].setParameter([a,b,this.theta,fx?0:1,0,this.pointArray[0].x, this.pointArray[0].y]);
        }
    });
};
ControlOval.prototype.updatePic = function () {
    let xcha = this.pointArray[0].x-this.pointArray[1].x;
    let ycha = this.pointArray[0].y-this.pointArray[1].y;
    let a = Math.abs(xcha);
    let b = Math.abs(ycha);
    let fx = xcha*ycha>0?1:0;
    this.picArray[0].setParameter([this.pointArray[0].x, this.pointArray[0].y]);
    this.picArray[1].setParameter([a,b,this.theta,fx,0,this.pointArray[1].x, this.pointArray[1].y]);
    this.picArray[2].setParameter([a,b,this.theta,fx?0:1,0,this.pointArray[0].x, this.pointArray[0].y]);
};

ControlOval.prototype.showEdit = function (picArray, pointArray, callback, updateShow) {
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
    //输入旋转角度
    const changeOvalTheta = (e)=>{
        if (e == this.theta)
            return;
        e = e||0;
        e = e<0?0:e;
        e = e>360?360:e;
        let xcha = this.pointArray[0].x-this.pointArray[1].x;
        let ycha = this.pointArray[0].y-this.pointArray[1].y;
        let a = Math.abs(xcha);
        let b = Math.abs(ycha);
        let fx = xcha*ycha>0?1:0;
        this.picArray[0].setParameter([this.pointArray[0].x, this.pointArray[0].y]);
        this.picArray[1].setParameter([a,b,e,fx,0,this.pointArray[1].x, this.pointArray[1].y]);
        this.picArray[2].setParameter([a,b,e,fx?0:1,0,this.pointArray[0].x, this.pointArray[0].y]);
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
                <span>旋转角度(°): </span>
                <InputNumber size='small' step={1}  min={0} max={360} defaultValue={this.theta} onChange={changeOvalTheta}/>
            </div>
            {
                this.pointArray.map((item, i)=>{
                    return (
                        i<this.controlNum &&
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

export {ControlOval};