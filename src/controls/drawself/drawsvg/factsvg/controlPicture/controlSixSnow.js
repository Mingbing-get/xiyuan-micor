import {OnePicture} from '../onePicture.js';

import {MovePic} from '../factPictures/movePicture.js'
import {LinePic} from '../factPictures/linePicture.js'
import {Input, InputNumber, Slider} from "antd";
import React from "react";
//继承OnePicture
function ControlSixSnow(picArray, style, pointArray) {
    OnePicture.call(this, picArray, true, style, pointArray);
    this.picname='sixsnow';
    this.controlNum = 2;
    this.theta = 2;//表示雪花递归的深度
}
ControlSixSnow.prototype = new OnePicture();
ControlSixSnow.prototype.constructor = ControlSixSnow;

//重写必须要重写的方法
ControlSixSnow.prototype.afterSetPoint = function (pointArray) {
    if (!pointArray || !pointArray.length)
        return;
    if (pointArray.length >= this.controlNum){
        this.drawSnow();
    }
};
ControlSixSnow.prototype.afterAddPoint = function (point, index) {
    if (this.notEmptyLength(this.pointArray) === this.controlNum){
        this.drawSnow();
    }
};
ControlSixSnow.prototype.afterChangePoint = function (point, picArray) {
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
ControlSixSnow.prototype.updatePic = function () {
    this.clearpic();
    this.drawSnow();
};

ControlSixSnow.prototype.showEdit = function (picArray, pointArray, callback, updateShow) {
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
ControlSixSnow.prototype.drawSnow = function (theta, center, end) {
    if (theta === 0){
        const r = Math.sqrt(Math.pow(center.x-end.x, 2)+Math.pow(center.y-end.y, 2));
        const smr = Math.sqrt(3)/3*r;
        const cs_t = r===0?0:(end.x-center.x)/r;
        const si_t = r===0?0:(end.y-center.y)/r;
        let x = end.x;
        let y = end.y;
        let smx = 0;
        let smy = 0;
        this.appendOne(new MovePic([x,y]));
        for (let i = 0; i < 6; i++){
            //计算靠内的点的坐标
            let cs_smi = Math.cos((i+0.5)/3*Math.PI);
            let si_smi = Math.sin((i+0.5)/3*Math.PI);
            smx = smr*(cs_t*cs_smi-si_t*si_smi)+center.x;
            smy = smr*(si_t*cs_smi+cs_t*si_smi)+center.y;
            this.appendOne(new LinePic([smx, smy]));
            let cs_i = Math.cos((i+1)/3*Math.PI);
            let si_i = Math.sin((i+1)/3*Math.PI);
            x = r*(cs_t*cs_i-si_t*si_i)+center.x;
            y = r*(si_t*cs_i+cs_t*si_i)+center.y;
            this.appendOne(new LinePic([x, y]));
        }
        return;
    }
    theta = theta || this.theta;
    center = center || this.pointArray[0];
    end = end || this.pointArray[1];
    const r = Math.sqrt(Math.pow(center.x-end.x, 2)+Math.pow(center.y-end.y, 2));
    const cs_t = r===0?0:(end.x-center.x)/r;
    const si_t = r===0?0:(end.y-center.y)/r;
    for (let i = 0; i < 6; i++){
        let cs_i = Math.cos(i/3*Math.PI);
        let si_i = Math.sin(i/3*Math.PI);
        let x = r*(cs_t*cs_i-si_t*si_i)+center.x;
        let y = r*(si_t*cs_i+cs_t*si_i)+center.y;
        this.drawSnow(theta-1, {x:center.x/3+2*x/3, y:center.y/3+2*y/3}, {x,y});
    }
};

export {ControlSixSnow};