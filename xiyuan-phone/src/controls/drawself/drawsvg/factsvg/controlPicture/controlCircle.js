import {OnePicture} from '../onePicture.js';

import {MovePic} from '../factPictures/movePicture.js'
import {ArcPic} from '../factPictures/arcPicture.js'
import {Button, Input, InputNumber, Slider} from "antd";
import React from "react";
import {Point} from "../point";
//继承OnePicture
function ControlCircle(picArray, style, pointArray) {
    OnePicture.call(this, picArray, false, style, pointArray);
    this.picname='circle';
    this.controlNum = 2;
}
ControlCircle.prototype = new OnePicture();
ControlCircle.prototype.constructor = ControlCircle;

//重写必须要重写的方法
ControlCircle.prototype.afterSetPoint = function (pointArray) {
    if (!pointArray || !pointArray.length)
        return;
    if (pointArray.length >= this.controlNum){
        this.drawCircle();
    }
};
ControlCircle.prototype.afterAddPoint = function (point, index) {
    if (this.notEmptyLength(this.pointArray) === this.controlNum){
        this.drawCircle();
    }
    if (this.pointArray.length > this.controlNum){
        let location = this.extraPoint(point.extra);
        point.x = location.x;
        point.y = location.y;
    }
};
ControlCircle.prototype.afterChangePoint = function (point, picArray) {
    let thisIndex = picArray.indexOf(this);
    let flag = false;//用于表示该点是控制点还是附属点,false表示附属点
    //判断改变的这个点是该图形的控制点还是附属点
    point.control.forEach(item=>{
        if (item.arrin!==thisIndex){
            return;
        }
        if (item.pic < this.controlNum){
            this.updatePic();
            flag = true;
        }
    });
    if (!flag) //若改变的是这个图形的附属点，，则该图形不会变化，则不需要改变其他附属点的位置
        return;
    let r = Math.sqrt(Math.pow(this.pointArray[0].x-this.pointArray[1].x, 2)+Math.pow(this.pointArray[0].y-this.pointArray[1].y, 2));
    this.pointArray.forEach((value,index)=>{
        if (index < this.controlNum)
            return;
        let newx = this.pointArray[0].x+r*Math.cos(value.extra.theta/180*Math.PI);
        let newy = this.pointArray[0].y-r*Math.sin(value.extra.theta/180*Math.PI);
        value.changeLocation(newx, newy, picArray);
    });
};
ControlCircle.prototype.updatePic = function () {
    let startx = 2*this.pointArray[0].x-this.pointArray[1].x;
    let starty = 2*this.pointArray[0].y-this.pointArray[1].y;
    let r = Math.sqrt(Math.pow(this.pointArray[0].x-this.pointArray[1].x, 2)+Math.pow(this.pointArray[0].y-this.pointArray[1].y, 2));
    this.picArray[0].setParameter([startx, starty]);
    this.picArray[1].setParameter([r,r,0,1,0,this.pointArray[1].x,this.pointArray[1].y]);
    this.picArray[2].setParameter([r,r,0,1,0,startx, starty]);
};

ControlCircle.prototype.showEdit = function (picArray, pointArray, callback, updateShow) {
    let r = Math.sqrt(Math.pow(this.pointArray[0].x-this.pointArray[1].x, 2)+Math.pow(this.pointArray[0].y-this.pointArray[1].y, 2));
    //输入x的坐标
    const changeCenterX = (e)=>{
        e = e||0;
        let newx = this.pointArray[1].x+e-this.pointArray[0].x;
        this.pointArray[1].x = newx;
        this.pointArray[0].changeLocation(e, this.pointArray[0].y, picArray);
        callback();
    };
    //输入y的坐标
    const changeCenterY = (e)=>{
        e = e||0;
        let newy = this.pointArray[1].y+e-this.pointArray[0].y;
        this.pointArray[1].y = newy;
        this.pointArray[0].changeLocation(this.pointArray[0].x, e, picArray);
        callback();
    };
    //输入半径
    const changeR = (e)=>{
        if (!e || e<0)
            return;
        if (!this.pointArray[1].extra){
            let newx = e/r*(this.pointArray[1].x-this.pointArray[0].x)+this.pointArray[0].x;
            let newy = e/r*(this.pointArray[1].y-this.pointArray[0].y)+this.pointArray[0].y;
            r = e;
            this.pointArray[1].changeLocation(newx, newy, picArray);
            callback();
        }
        else if (!this.pointArray[0].extra){
            let newx = e/r*(this.pointArray[0].x-this.pointArray[1].x)+this.pointArray[1].x;
            let newy = e/r*(this.pointArray[0].y-this.pointArray[1].y)+this.pointArray[1].y;
            r = e;
            this.pointArray[0].changeLocation(newx, newy, picArray);
            callback();
        }
    };
    //添加附加点
    const addpoint = () =>{
        let thisIndex = picArray.indexOf(this);
        let p = new Point(this.pointArray[0].x+r, this.pointArray[0].y, [{arrin:thisIndex, pic:this.pointArray.length}], {arrin:thisIndex, theta:0});
        this.addPoint(p);
        pointArray.push(p);
        callback();
        updateShow();
    };
    //改变附加点的位置
    const changetheta = (e, item)=>{
        if (e == item.extra.theta)
            return;
        e = e||0;
        e = e<0?0:e;
        e = e>360?360:e;
        let newx = this.pointArray[0].x+r*Math.cos(e/180*Math.PI);
        let newy = this.pointArray[0].y-r*Math.sin(e/180*Math.PI);
        item.extra.theta = e;
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
                <span>圆心: x:</span>
                <InputNumber size='small' step={1} disabled={!!this.pointArray[0].extra || !!this.pointArray[1].extra} defaultValue={this.pointArray[0].x} onChange={changeCenterX}/>
                <span>y:</span>
                <InputNumber size='small' step={1} disabled={!!this.pointArray[0].extra || !!this.pointArray[1].extra} defaultValue={this.pointArray[0].y} onChange={changeCenterY}/>
                <span>半径:</span>
                <InputNumber size='small' step={1} disabled={!!this.pointArray[0].extra && !!this.pointArray[1].extra} defaultValue={r} onChange={changeR}/>
            </div>
            {
                this.pointArray.map((item, i)=>{
                    if (i<this.controlNum)
                        return;
                    return (
                        <div className='edit-one' key={i}>
                            <span>点{i+1}: 角度:</span>
                            <InputNumber
                                min={0}
                                max={360}
                                size='small'
                                step={1}
                                defaultValue={item.extra.theta}
                                onChange={(e)=>{changetheta(e, item)}}
                            />
                        </div>
                    )
                })
            }
            <Button size='small' type='primary' block onClick={addpoint}>添加附属点</Button>
        </div>
    )
};

ControlCircle.prototype.drawCircle = function () {
    let startx = 2*this.pointArray[0].x-this.pointArray[1].x;
    let starty = 2*this.pointArray[0].y-this.pointArray[1].y;
    let r = Math.sqrt(Math.pow(this.pointArray[0].x-this.pointArray[1].x, 2)+Math.pow(this.pointArray[0].y-this.pointArray[1].y, 2));
    this.appendOne(new MovePic([startx, starty]));
    this.appendOne(new ArcPic([r,r,0,1,0,this.pointArray[1].x,this.pointArray[1].y]));
    this.appendOne(new ArcPic([r,r,0,1,0,startx, starty]));
};
ControlCircle.prototype.extraPoint = function (extra) {
    if (!extra || this.pointArray.length < 2)
        return;
    let r = Math.sqrt(Math.pow(this.pointArray[0].x-this.pointArray[1].x, 2)+Math.pow(this.pointArray[0].y-this.pointArray[1].y, 2));
    let newx = this.pointArray[0].x+r*Math.cos(extra.theta/180*Math.PI);
    let newy = this.pointArray[0].y-r*Math.sin(extra.theta/180*Math.PI);
    return {x:newx, y:newy};
};

export {ControlCircle};