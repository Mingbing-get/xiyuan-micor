import {OnePicture} from '../onePicture.js';

import {MovePic} from '../factPictures/movePicture.js'
import {LinePic} from '../factPictures/linePicture.js'
import {Button, Input, InputNumber, Slider} from "antd";
import React from "react";
import {Point} from "../point";
//继承OnePicture
function ControlRect(picArray, style, pointArray) {
    OnePicture.call(this, picArray, true, style, pointArray);
    this.picname='rect';
    this.controlNum = 2;
}
ControlRect.prototype = new OnePicture();
ControlRect.prototype.constructor = ControlRect;

//重写必须要重写的方法
ControlRect.prototype.afterSetPoint = function (pointArray) {
    if (!pointArray || !pointArray.length)
        return;
    if (pointArray.length >= this.controlNum){
        this.drawRect();
    }
};
ControlRect.prototype.afterAddPoint = function (point, index) {
    if (this.notEmptyLength(this.pointArray) === this.controlNum){
        this.drawRect();
    }
    else if (this.pointArray.length > this.controlNum){
        let location = this.extraPoint(point.extra);
        point.x = location.x;
        point.y = location.y;
    }
};
ControlRect.prototype.afterChangePoint = function (point, picArray) {
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
    this.pointArray.forEach((value,index)=>{
        if (index < this.controlNum)
            return;
        let location = this.extraPoint(value.extra);
        value.changeLocation(location.x, location.y, picArray);
    });
};
ControlRect.prototype.updatePic = function () {
    this.picArray[0].setParameter([this.pointArray[0].x, this.pointArray[0].y]);
    this.picArray[1].setParameter([this.pointArray[1].x,this.pointArray[0].y]);
    this.picArray[2].setParameter([this.pointArray[1].x,this.pointArray[1].y]);
    this.picArray[3].setParameter([this.pointArray[0].x,this.pointArray[1].y]);
};

ControlRect.prototype.showEdit = function (picArray, pointArray, callback, updateShow) {
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
        let p = new Point(this.pointArray[0].x, this.pointArray[0].y, [{arrin:thisIndex, pic:this.pointArray.length}], {arrin:thisIndex, fline:0, bi:0});
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
        let location = this.extraPoint({fline:item.extra.fline, bi:e});
        item.extra.bi = e;
        item.changeLocation(location.x, location.y, picArray);
        callback();
    };
    //改变属于那一条线
    const changefline = (e, item)=>{
        e = e?e-1:0;
        e = e<0?0:e;
        e = e>3?3:e;
        if (e == item.extra.fline)
            return;
        let location = this.extraPoint({fline:e, bi:item.extra.bi});
        item.extra.fline = e;
        item.changeLocation(location.x, location.y, picArray);
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
                                <span>点{i+1}: 属于第几条边:</span>
                                <InputNumber
                                    min={1}
                                    max={4}
                                    size='small'
                                    step={1}
                                    defaultValue={item.extra.fline+1}
                                    onChange={(e)=>{changefline(e, item)}}
                                />
                                <span>位置:</span>
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
//自己新增的方法
ControlRect.prototype.drawRect = function () {
    this.appendOne(new MovePic([this.pointArray[0].x, this.pointArray[0].y]));
    this.appendOne(new LinePic([this.pointArray[1].x, this.pointArray[0].y]));
    this.appendOne(new LinePic([this.pointArray[1].x, this.pointArray[1].y]));
    this.appendOne(new LinePic([this.pointArray[0].x, this.pointArray[1].y]));
};
ControlRect.prototype.extraPoint = function (extra) {
    if (!extra || this.pointArray.length < 2)
        return;
    let newx = 0;
    let newy = 0;
    if (extra.fline===0){
        newx = this.pointArray[1].x*extra.bi+this.pointArray[0].x*(1-extra.bi);
        newy = this.pointArray[0].y;
    }
    else if (extra.fline===1){
        newx = this.pointArray[1].x;
        newy = this.pointArray[1].y*extra.bi+this.pointArray[0].y*(1-extra.bi);
    }
    else if (extra.fline===2){
        newx = this.pointArray[0].x*extra.bi+this.pointArray[1].x*(1-extra.bi);
        newy = this.pointArray[1].y;
    }
    else if (extra.fline===3){
        newx = this.pointArray[0].x;
        newy = this.pointArray[0].y*extra.bi+this.pointArray[1].y*(1-extra.bi);
    }
    return {x:newx, y:newy}
};

export {ControlRect};