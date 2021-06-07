import React, { useState, useEffect, useRef } from 'react';

import { Menu, Modal, Input, InputNumber, message, Slider } from 'antd';
import Icon from '@ant-design/icons';
import 'antd/dist/antd.css';
import './index.css';

import {Undo, Redo} from './myIcon.jsx';

import {ControlLine} from './factsvg/controlPicture/controlLine.js';
import {ControlCircle} from './factsvg/controlPicture/controlCircle.js';
import {ControlRect} from './factsvg/controlPicture/controlRect.js';
import {ControlTriangle} from './factsvg/controlPicture/controlTriangle.js';
import {ControlOval} from './factsvg/controlPicture/controlOval.js';
import {ControlPolygon} from './factsvg/controlPicture/controlPolygon.js';
import {ControlStar} from './factsvg/controlPicture/controlStar.js';
import {ControlSnow} from './factsvg/controlPicture/controlSnow.js';
import {ControlSixSnow} from './factsvg/controlPicture/controlSixSnow.js';
import {ControlLineSnow} from './factsvg/controlPicture/controlLineSnow.js';

import {Point} from './factsvg/point.js';

const { SubMenu } = Menu;
const { info } = Modal;

const UndoIcon = props => <Icon component={Undo} {...props} />;
const RedoIcon = props => <Icon component={Redo} {...props} />;

function Drawsvg(props) {
    const [currentX, setCurrentX] = useState(-1);
    const [currentY, setCurrentY] = useState(-1);
    const [fangdou, setFangdou] = useState(true);
    const [pictureArray, setPictureArray] = useState([]);
    const [pointArray, setPointArray] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [drawCurrent, setDrawCurrent] = useState(-1);
    const [circleIndex, setCircleIndex] = useState(-1);
    const [circleR, setCircleR] = useState(3);
    const [newpicstyle, setNewpicstyle] = useState({stroke: '#000000', fill: '#ffffff00'});
    const boxRef = useRef(null);
    const [style, setStyle] = useState({});
    const [pathStyle, setPathStyle] = useState({cursor: 'auto'});
    const [pointStyle, setPointStyle] = useState({cursor: 'auto'});
    const [svgStyle, setSvgStyle] = useState({cursor: 'auto', backgroundColor:'#ffffff', height:500});
    const [keyPath, setKeyPath] = useState('');
    const [forceupdate, setForceupdate] = useState(0);
    const [orderPoint, setOrderPoint] = useState(0);
    const [pass, setPass] = useState([]);
    const [futre, setFutre] = useState([]);
    const [init, setInit] = useState(true);
    const [selectPicIndex, setSelectPicIndex] = useState(-1);
    const [selectPicName, setSelectPicName] = useState('未选择');
    const [doubleClick, setDoubleClick] = useState(false);
    const [isdelete, setIsdelelte] = useState({});
    const [moveSvg, setMoveSvg] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [zoomSize, setZoomSize] = useState(0.1);
    const [polygonNum, setPolygonNum] = useState(0);
    //初始化恢复数据
    useEffect(()=>{
        let picBTemp = props.pictureArray || '[]';
        let pointBTemp = props.pointArray || '[]';
        stringToObj(picBTemp, pointBTemp);
        setPass([{picTemp:picBTemp, pointTemp:pointBTemp}]);
        let tsvgStyle = {...svgStyle};
        if (props.backgroundColor)
            tsvgStyle.backgroundColor=props.backgroundColor;
        if (props.height)
            tsvgStyle.height=props.height;
        setSvgStyle(tsvgStyle);
    },[]);
    //数据发生改变，通知外界并将数据传出，并且在此处做数据备份，方便使用恢复上一步数据
    useEffect(()=>{
        if (init){ //初始化时不需要添加在此处添加pass
            setInit(false);
            return;
        }
        if (forceupdate===0 && currentIndex===-1 && circleIndex===-1 && drawCurrent===-1 && orderPoint===0 && !moveSvg){
            let picture = [];
            pictureArray.forEach(item=>{
                picture.push({picname:item.picname, style:item.style, controlNum:item.controlNum, theta:item.theta});
            });
            let picTemp = JSON.stringify(picture);
            let pointTemp = JSON.stringify(pointArray);
            setPass([...pass, {picTemp, pointTemp}]);
            setFutre([]);
            props.onChange && props.onChange(picTemp, pointTemp);
        }
    },[forceupdate, currentIndex, circleIndex, drawCurrent, orderPoint, isdelete, moveSvg, zoom]);
    //当点击的是图形
    function onmousedown(e, index) {
        if (keyPath !== 'control/movepic')
            return;
        pictureArray[index].setTempStyle({stroke:'blue'});
        setCurrentIndex(index);
        setCurrentX(e.clientX);
        setCurrentY(e.clientY);
    }
    //当按下控制圈
    function onmousedowncircle(e, circlei) {
        if (keyPath !== 'control/movepoint')
            return;
        setCircleIndex(circlei);
        setCurrentX(e.clientX);
        setCurrentY(e.clientY);
    }
    //当按下画布
    function onmousedownsvg(e) {
        if (keyPath !== 'control/movesvg')
            return;
        setMoveSvg(true);
        setCurrentX(e.clientX);
        setCurrentY(e.clientY);
    }
    function onmousemove(e) {
        if (currentIndex === -1 && circleIndex === -1 && !moveSvg)
            return;
        if (fangdou){
            if (currentIndex !== -1){
                //当移动的是本身的图形
                pictureArray[currentIndex].addAllLocation(e.clientX-currentX, e.clientY-currentY, pictureArray);
                setCurrentX(e.clientX);
                setCurrentY(e.clientY);
            }
            else if (circleIndex !== -1) {
                //移动的是控制圈
                let location = getLocation(e.clientX, e.clientY);
                pointArray[circleIndex].changeLocation(location.x, location.y, pictureArray);
            }
            else if (moveSvg){
                pointArray.forEach(item=>{
                    item.onlyAddPoint(e.clientX-currentX, e.clientY-currentY);
                });
                pictureArray.forEach(item=>{
                    item.updatePic();
                });
                setCurrentX(e.clientX);
                setCurrentY(e.clientY);
            }
            setFangdou(false);
            setTimeout(()=>{
                setFangdou(true);
            },20);
        }
    }
    function onmouseup(e) {
        if (currentIndex === -1 && circleIndex === -1 && !moveSvg)
            return;
        currentIndex !== -1 && pictureArray[currentIndex].setTempStyle({});
        setCurrentIndex(-1);
        setCircleIndex(-1);
        setMoveSvg(false);
        setCurrentX(-1);
        setCurrentY(-1);
    }

    //点击图形
    function picClick(e, index) {
        if (keyPath !== 'control/select' && keyPath !== '')
            return;
        if (!doubleClick){
            setSelectPicIndex(index);
            setSelectPicName(getPicName(pictureArray[index].picname));
            setDoubleClick(true);
            setTimeout(()=>{
                setDoubleClick(false);
            },500);
        }
        else {
            showEditPic();
        }
    }
    //显示编辑单个图形的弹出框
    function showEditPic() {
        if (selectPicIndex === -1)
            return;
        const showedit = info({
            title: '编辑图形',
            icon: null,
            content: pictureArray[selectPicIndex].showEdit(pictureArray, pointArray, ()=>{setForceupdate({});}, updateShow),
            okText:'关闭',
            onOk:()=>{setForceupdate(0)},
            width:500,
            className:'my-confirm'
        });
        function updateShow() {
            showedit.update({
                content: pictureArray[selectPicIndex].showEdit(pictureArray, pointArray, ()=>{setForceupdate({});}, updateShow),
            });
        }
    }
    //删除选择的图形
    function deletePic() {
        let pointTemp = [...pointArray];
        pictureArray[selectPicIndex].pointArray.forEach(point=>{
            if (point.control.length === 1){
                //表示该点只出现在要删除的图形上面，则将该点删除
                let index = pointTemp.findIndex(v=>v===point);
                pointTemp = [...pointTemp.slice(0,index), ...pointTemp.slice(index+1)];
            }
            else {
                //表示该点出现在别的图形上面，则删除该点对该图形的control，若该点为附属点，则转化为控制点
                let index = point.control.findIndex(v=>v.arrin===selectPicIndex);
                point.control = [...point.control.slice(0,index), ...point.control.slice(index+1)];
                delete point.extra;
            }
        });
        //将所有的点，大于该图形的索引减一
        pointTemp.forEach(item=>{
            item.control.forEach(value=>{
                if (value.arrin>selectPicIndex){
                    value.arrin--;
                }
            });
            if (item.extra && item.extra.arrin>selectPicIndex){
                item.extra.arrin--;
            }
        });
        setPictureArray([...pictureArray.slice(0,selectPicIndex), ...pictureArray.slice(selectPicIndex+1)]);
        setPointArray(pointTemp);
        setIsdelelte({});
        setSelectPicIndex(-1);
        setSelectPicName('未选择');
    }
    //级联删除选择的图形
    function depDeletePic() {
        let pointTemp = [...pointArray];
        let picTemp = [...pictureArray];
        depForBakc([selectPicIndex], picTemp, pointTemp);
        setIsdelelte({});
        setSelectPicIndex(-1);
        setSelectPicName('未选择');
    }
    //级联的递归
    function depForBakc(indexarr, picTemp, pointTemp) {
        if (!indexarr || indexarr.length === 0){
            setPictureArray(picTemp);
            setPointArray(pointTemp);
            return;
        }
        let thisarr = [];
        //对indexarr内的值进行修改，所后的值比前面的大，则需要将后面的值减一(需要跟上picTemp变化的步伐)
        for (let i = 0; i < indexarr.length-1; i++){
            for (let j = i+1; j < indexarr.length; j++){
                if (indexarr[j] > indexarr[i]){
                    indexarr[j]--;
                }
            }
        }
        indexarr.forEach((i, ind)=>{
            picTemp[i].pointArray.forEach(item=>{
                if (item.extra && item.extra.arrin === i){
                    //若该点是该图形的附加点，则需要删除该点，和被该点控制的图形
                    item.control.forEach(value=>{
                        if (value.arrin !== i){
                            let flag = false;
                            for (let k = ind+1; k<indexarr.length; k++){
                                if (indexarr[k] === i)
                                    flag = true;
                            }
                            if (!flag)
                                thisarr.push(value.arrin);
                        }
                    });
                    item.control = [];
                    item.extra = null;
                    let index = pointTemp.findIndex(v=>v===item);
                    if (index !== -1)
                        pointTemp = [...pointTemp.slice(0,index), ...pointTemp.slice(index+1)];
                }
                else {
                    //若该点是该图形的控制点，则只需要检查该点是否控制别的图形，若没有则删除该点，若有则只删除对该图形的控制
                    if (item.control.length <= 1){
                        //表示该点只出现在要删除的图形上面，则将该点删除
                        let index = pointTemp.findIndex(v=>v===item);
                        if (index !== -1)
                            pointTemp = [...pointTemp.slice(0,index), ...pointTemp.slice(index+1)];
                    }
                    else {
                        //表示该点出现在别的图形上面，则删除该点对该图形的control
                        let index = item.control.findIndex(v=>v.arrin===i);
                        if (index !== -1)
                            item.control = [...item.control.slice(0,index), ...item.control.slice(index+1)];
                    }
                }
            });
            //将所有的点，大于该图形的索引减一
            pointTemp.forEach(item=>{
                item.control.forEach((value)=>{
                    if (value.arrin>i){
                        value.arrin--;
                    }
                });
                if (item.extra && item.extra.arrin>i){
                    item.extra.arrin--;
                }
            });
            thisarr = Array.from(thisarr, v=>{
                if (v>i){
                    return v-1;
                }
                return v;
            });
            picTemp = [...picTemp.slice(0,i), ...picTemp.slice(i+1)];
        });
        //去重
        let arrtemp = [];
        thisarr.forEach(v=>{
            let index = arrtemp.findIndex(arrv=>arrv===v);
            if (index === -1){
                arrtemp.push(v);
            }
        });
        depForBakc(arrtemp, picTemp, pointTemp);
    }
    
    //点击点，表示过该点画图
    function pointClick(index) {
        if (!keyPath.startsWith('overpoint/'))
            return;
        if (orderPoint === 0){
            pointArray[index].control.push({arrin:pictureArray.length, pic:0});
            let pic = getPicture(keyPath.replace('overpoint','draw'));
            if (pic.picname==='polygon'){
                //多边形需要先定义边的数量
                pic.controlNum = polygonNum||3;
            }
            setPolygonNum(0);
            pic.addPoint(pointArray[index]);
            pic.setStyle({...newpicstyle});
            setPictureArray([...pictureArray, pic]);
            setOrderPoint(1);
        }
        else{
            if (pictureArray[pictureArray.length-1].pointArray.includes(pointArray[index])){
                message.destroy();
                message.warning('一个图形不可过同一点!');
                return;
            }
            pointArray[index].control.push({arrin:pictureArray.length-1, pic:orderPoint});
            pictureArray[pictureArray.length-1].addPoint(pointArray[index]);
            setOrderPoint(orderPoint+1);
        }
        message.destroy();
        message.info('选择了第'+(orderPoint+1)+'个点');
        //判断图形是否画完
        if (orderPoint+1 === pictureArray[pictureArray.length-1].controlNum){
            endoverpoint();
        }
    }
    //结束过已有点画图
    function endoverpoint() {
        setOrderPoint(0);
        setKeyPath('');
        message.destroy();
        message.success('绘制完成!');
    }

    //点击菜单
    function handleClick(e) {
        //若还在创建图形，但是又没有创建完成的情况下，点击了菜单选项，则需要将未创建完成的图形取消
        cancelDontCompet();
        if (e.key==='setting'){
            showSetting();
            return;
        }
        if (e.key==='undo'){
            undo();
            return;
        }
        if (e.key==='redo'){
            redo();
            return;
        }
        if (e.key==='edit'){
            showEditPic();
            return;
        }
        if (e.key==='delete'){
            deletePic();
            return;
        }
        if (e.key==='depDelete'){
            depDeletePic();
            return;
        }
        if (e.key==='zoomIn'){
            zoomIn();
            return;
        }
        if (e.key==='zoomOut'){
            zoomOut();
            return;
        }
        let path = '';
        if (e.keyPath.includes('overpoint')){
            path = e.keyPath.reverse().join('/');
            path = path.substring(0,path.length-1);
            setKeyPath(path);
        }
        else{
            path = e.keyPath.reverse().join('/');
            setKeyPath(path);
        }
        //判断是否需要自定义初始属性
        if (path.indexOf('polygon') !== -1){
            showInitPic(path);
        }
        if (e.keyPath.includes('draw')){
            setStyle({
                cursor: 'crosshair',
                zIndex: 100
            });
        }
        else {
            setStyle({
                cursor: 'auto',
                zIndex: -10
            });
        }
        if (e.keyPath.includes('movepoint')){
            setPointStyle({cursor: 'move'});
            setPathStyle({cursor: 'auto'});
        }
        else if (e.keyPath.includes('movepic')){
            setPointStyle({cursor: 'auto'});
            setPathStyle({cursor: 'move'});
        }
        else{
            setPointStyle({cursor: 'auto'});
            setPathStyle({cursor: 'auto'});
        }
        if (e.keyPath.includes('movesvg')){
            setSvgStyle({
                ...svgStyle,
                cursor: 'grab'
            });
        }
        else {
            setSvgStyle({
                ...svgStyle,
                cursor: 'auto'
            });
        }
    }
    //显示设置面板
    function showSetting() {
        info({
            title: '设置',
            icon: null,
            content: <div className='setting-box'>
                <div className='setting-one'>
                    <span>控制点半径:</span>
                    <InputNumber size='small' defaultValue={circleR} min={1} step={1} onChange={changeR}/>
                </div>
                <div className='setting-one'>
                    <span>线的宽:</span>
                    <InputNumber size='small' defaultValue={newpicstyle.strokeWidth===0?0:(newpicstyle.strokeWidth||1)} min={0} step={1} onChange={changeLineWidth}/>
                </div>
                <div className='setting-one'>
                    <span>线的颜色:</span>
                    <Input size='small' defaultValue={newpicstyle.stroke} type='color' onChange={changeLineColor}/>
                </div>
                <div className='setting-one'>
                    <span>画布的颜色:</span>
                    <Input size='small' defaultValue={svgStyle.backgroundColor} type='color' onChange={changeBgColor}/>
                </div>
                <div className='setting-one'>
                    <span>画布的高:</span>
                    <InputNumber size='small' defaultValue={svgStyle.height||500} min={0} step={1} onChange={changeSvgHeight}/>
                </div>
                <div className='setting-one'>
                    <span>填充颜色:</span>
                    <Input size='small' defaultValue={newpicstyle.fill.substring(0,7)} type='color' onChange={changeFillColor}/>
                </div>
                <div className='setting-one'>
                    <span>填充透明度:</span>
                    <Slider min={0} max={255} defaultValue={newpicstyle.arfa||0} tooltipVisible onChange={changearfa} />
                </div>
            </div>,
            okText:'关闭',
            width:300,
            className:'my-confirm'
        });
    }
    //修改控制点的半径
    function changeR(e) {
        e = parseInt(e)||1;
        e = e<1?1:e;
        setCircleR(e);
    }
    //修改线的宽度
    function changeLineWidth(e) {
        e = parseInt(e)||0;
        e = e<0?0:e;
        setNewpicstyle({...newpicstyle, strokeWidth:e});
    }
    //修改线的颜色
    function changeLineColor(e) {
        setNewpicstyle({...newpicstyle, stroke:e.target.value});
    }
    //修改背景颜色
    function changeBgColor(e) {
        setSvgStyle({...svgStyle, backgroundColor: e.target.value});
        props.changeBgc && props.changeBgc(e.target.value);
    }
    //修改画布的高
    function changeSvgHeight(e) {
        e = parseInt(e)||0;
        e = e<0?0:e;
        setSvgStyle({...svgStyle, height: e});
        props.changeHeight && props.changeHeight(e);
    }
    //修改填充颜色
    function changeFillColor(e) {
        let arfa = newpicstyle.arfa || 0;
        newpicstyle.fill = e.target.value+arfa.toString(16);
        setNewpicstyle(newpicstyle);
    }
    //修改填充色的透明度
    function changearfa(e) {
        newpicstyle.fill = newpicstyle.fill.substring(0,7)+e.toString(16);
        newpicstyle.arfa = e;
        setNewpicstyle(newpicstyle);
    }

    //显示自定义初始化的内容
    function showInitPic(path) {
        info({
            title: '图形初始化设置',
            icon: null,
            content: <div className='setting-box'>
                <div className='setting-one'>
                    <span>多边形的边数:</span>
                    <InputNumber size='small' defaultValue={3} min={3} step={1} onChange={(e)=>{e<3?setPolygonNum(3):setPolygonNum(parseInt(e))}}/>
                </div>
            </div>,
            okText:'关闭',
            width:300,
            className:'my-confirm'
        });
    }

    //取消创建图形
    function cancelDontCompet() {
        if (orderPoint !== 0){
            pictureArray[pictureArray.length-1].pointArray.forEach(point=>{
                point.control.pop();
            });
            setPictureArray([...pictureArray.slice(0,pictureArray.length-1)]);
            setOrderPoint(0);
            setKeyPath('');
            message.destroy();
            message.warning('绘制未完成，已取消!');
        }
        if (drawCurrent !== -1){
            let pointNum = pictureArray[pictureArray.length-1].pointArray.length;
            setPointArray([...pointArray.slice(0,pointArray.length-pointNum)]);
            setPictureArray([...pictureArray.slice(0,pictureArray.length-1)]);
            setDrawCurrent(-1);
            setKeyPath('');
            setStyle({
                cursor: 'auto',
                zIndex: -10
            });
            message.destroy();
            message.warning('绘制未完成，已取消!');
        }
    }

    //撤销和恢复
    function undo() {
        if (pass.length<=1)
            return;
        setFutre([...futre, pass[pass.length-1]]);
        stringToObj(pass[pass.length-2].picTemp, pass[pass.length-2].pointTemp);
        props.onChange && props.onChange(pass[pass.length-2].picTemp, pass[pass.length-2].pointTemp);
        setPass([...pass.slice(0,pass.length-1)]);
    }
    function redo() {
        if (futre.length===0)
            return;
        setPass([...pass, futre[futre.length-1]]);
        stringToObj(futre[futre.length-1].picTemp, futre[futre.length-1].pointTemp);
        props.onChange && props.onChange(futre[futre.length-1].picTemp, futre[futre.length-1].pointTemp);
        setFutre([...futre.slice(0,futre.length-1)]);
    }
    //根据保存的字符串数据生成实际图的对象
    function stringToObj(picBTemp, pointBTemp) {
        let picture = JSON.parse(picBTemp) || [];
        let point = JSON.parse(pointBTemp) || [];
        let picTemp = [];
        let pointTemp = [];
        //第一次遍历所有的图形，创建对应的图形对象，但是不添加点到图形中
        picture.forEach(item=>{
            let pic = getPic(item.picname);
            pic.controlNum = item.controlNum;
            pic.theta = item.theta;
            pic.setStyle(item.style);
            picTemp.push(pic);
        });
        //第二次遍历所有的点，将这些点添加到对应的图形中，并将这些点创建为点的对象
        point.forEach(item=>{
            let point = new Point(item.x, item.y, item.control, item.extra);
            pointTemp.push(point);
            item.control.forEach(value=>{
                picTemp[value.arrin].addPoint(point, value.pic);
            });
        });
        setPictureArray(picTemp);
        setPointArray(pointTemp);
    }

    //放大与缩小(以画布的中心为放缩点)
    function zoomIn() {
        const svg = boxRef.current.getElementsByTagName('svg')[0];
        const zoomx = svg.clientWidth/2;
        const zoomy = svg.clientHeight/2;
        pointArray.forEach(item=>{
            item.onlyAddPoint((item.x-zoomx)*zoomSize, (item.y-zoomy)*zoomSize);
        });
        pictureArray.forEach(item=>{
            item.updatePic();
        });
        setZoom(zoom+zoomSize);
    }
    function zoomOut() {
        if (zoom<0.15)
            return;
        const svg = boxRef.current.getElementsByTagName('svg')[0];
        const zoomx = svg.clientWidth/2;
        const zoomy = svg.clientHeight/2;
        pointArray.forEach(item=>{
            item.onlyAddPoint((zoomx-item.x)*zoomSize, (zoomy-item.y)*zoomSize);
        });
        pictureArray.forEach(item=>{
            item.updatePic();
        });
        setZoom(zoom-zoomSize);
    }

    //画布的事件
    function drawMouseDown(e) {
        if (drawCurrent === -1) {
            setDrawCurrent(1);
            let location = getLocation(e.clientX, e.clientY);
            let p1 = new Point(location.x,location.y,[{arrin:pictureArray.length,pic:0}]);
            let p2 = new Point(location.x,location.y,[{arrin:pictureArray.length,pic:1}]);
            setPointArray([...pointArray, p1, p2]);
            let pic = getPicture(keyPath);
            if (pic.picname==='polygon'){
                //多边形需要先定义边的数量
                pic.controlNum = polygonNum||3;
            }
            setPolygonNum(0);
            pic.setPointArray([p1, p2]);
            pic.setStyle({...newpicstyle});
            setPictureArray([...pictureArray, pic]);
        }
        else {
            setDrawCurrent(drawCurrent+1);
        }
    }
    function drawMouseMove(e) {
        if (drawCurrent === -1)
            return;
        if (fangdou){
            let location = getLocation(e.clientX, e.clientY);
            pointArray[pointArray.length-1].changeLocation(location.x, location.y, pictureArray);
            setFangdou(false);
            setTimeout(()=>{
                setFangdou(true);
            },20);
        }
    }
    function drawMouseUp(e) {
        if (drawCurrent+1 === pictureArray[pictureArray.length-1].controlNum){
            drawEnd();
        }
        else if (drawCurrent+1 < pictureArray[pictureArray.length-1].controlNum){
            let location = getLocation(e.clientX, e.clientY);
            let p = new Point(location.x,location.y,[{arrin:pictureArray.length-1,pic:drawCurrent+1}]);
            setPointArray([...pointArray, p]);
            pictureArray[pictureArray.length-1].addPoint(p);
        }
    }
    //结束画图
    function drawEnd() {
        setDrawCurrent(-1);
        setKeyPath('');
        setStyle({
            cursor: 'auto',
            zIndex: -10
        });
    }
    //根据选择的图形获取不同的图形对象
    function getPicture(keyPath) {
        let picname = keyPath.substring(keyPath.indexOf('/')+1);
        return getPic(picname);
    }
    function getPic(picname) {
        let pic = null;
        switch (picname) {
            case 'line':
                pic = new ControlLine();
                break;
            case 'circle':
                pic = new ControlCircle();
                break;
            case 'rect':
                pic = new ControlRect();
                break;
            case 'triangle':
                pic = new ControlTriangle();
                break;
            case 'oval':
                pic = new ControlOval();
                break;
            case 'polygon':
                pic = new ControlPolygon();
                break;
            case 'star':
                pic = new ControlStar();
                break;
            case 'snow':
                pic = new ControlSnow();
                break;
            case 'sixsnow':
                pic = new ControlSixSnow();
                break;
            case 'linesnow':
                pic = new ControlLineSnow();
                break;
            default:
                break;
        }
        return pic;
    }
    function getPicName(picname) {
        let pic = '未选择';
        switch (picname) {
            case 'line':
                pic = '线段';
                break;
            case 'circle':
                pic = '圆';
                break;
            case 'rect':
                pic = '矩形';
                break;
            case 'triangle':
                pic = '三角形';
                break;
            case 'oval':
                pic = '椭圆';
                break;
            case 'polygon':
                pic = '多边形';
                break;
            case 'star':
                pic = '五角星';
                break;
            case 'snow':
                pic = '雪花';
                break;
            case 'sixsnow':
                pic = '六边雪花';
                break;
            case 'linesnow':
                pic = '线条雪花';
                break;
            default:
                break;
        }
        return pic;
    }
    //获取点击处相对于画布的实际坐标
    function getLocation(x,y) {
        let location = {};
        let offsetTop = boxRef.current.offsetTop;
        let offsetLeft = boxRef.current.offsetLeft;
        let current = boxRef.current.offsetParent;
        while (current !== null) {
            offsetTop += current.offsetTop;
            offsetLeft += current.offsetLeft;
            current = current.offsetParent;
        }
        location.y = y-(offsetTop-document.documentElement.scrollTop);
        location.x = x-(offsetLeft-document.documentElement.scrollLeft);
        return location;
    }
    return(
        <div>
            <Menu onClick={handleClick} mode="horizontal" className='drawsvg-menu' inlineIndent={12}>
                <Menu.Item key="undo" disabled={pass.length<=1}>
                    <UndoIcon style={{fontSize:20}}/>
                </Menu.Item>
                <Menu.Item key="redo" disabled={futre.length===0}>
                    <RedoIcon style={{fontSize:20}}/>
                </Menu.Item>
                <SubMenu key="control" title="操作" popupClassName='drawsvg'>
                    <Menu.Item key="select">选择</Menu.Item>
                    <Menu.Item key="movepic">移动图形</Menu.Item>
                    <Menu.Item key="movepoint">移动点</Menu.Item>
                    <Menu.Item key="movesvg">移动画布</Menu.Item>
                    <Menu.Item key="zoomIn">放大 ×{zoom.toFixed(1)}</Menu.Item>
                    <Menu.Item key="zoomOut" disabled={zoom<0.15}>缩小 ×{zoom.toFixed(1)}</Menu.Item>
                </SubMenu>
                <SubMenu key="picture" disabled={selectPicIndex===-1} title={selectPicName} popupClassName='drawsvg'>
                    <Menu.Item key="edit">编辑</Menu.Item>
                    <Menu.Item key="delete">删除</Menu.Item>
                    <Menu.Item key="depDelete">级联删除</Menu.Item>
                </SubMenu>
                <SubMenu key="draw" title="新建图形" popupClassName='drawsvg'>
                    <Menu.ItemGroup title="直线">
                        <Menu.Item key="line">线段</Menu.Item>
                    </Menu.ItemGroup>
                    <Menu.ItemGroup title="多边形">
                        <Menu.Item key="rect">矩形</Menu.Item>
                        <Menu.Item key="triangle">三角形</Menu.Item>
                        <Menu.Item key="polygon">自定义多边形</Menu.Item>
                    </Menu.ItemGroup>
                    <Menu.ItemGroup title="圆">
                        <Menu.Item key="circle">圆形</Menu.Item>
                        <Menu.Item key="oval">椭圆</Menu.Item>
                    </Menu.ItemGroup>
                    <Menu.ItemGroup title="其他">
                        <Menu.Item key="star">五角星</Menu.Item>
                        <Menu.Item key="snow">雪花</Menu.Item>
                        <Menu.Item key="sixsnow">六边雪花</Menu.Item>
                        <Menu.Item key="linesnow">线条雪花</Menu.Item>
                    </Menu.ItemGroup>
                </SubMenu>
                <SubMenu key="overpoint" title="过已有点画" popupClassName='drawsvg'>
                    <Menu.ItemGroup title="直线">
                        <Menu.Item key="lineO">线段</Menu.Item>
                    </Menu.ItemGroup>
                    <Menu.ItemGroup title="多边形">
                        <Menu.Item key="rectO">矩形</Menu.Item>
                        <Menu.Item key="triangleO">三角形</Menu.Item>
                        <Menu.Item key="polygonO">自定义多边形</Menu.Item>
                    </Menu.ItemGroup>
                    <Menu.ItemGroup title="圆">
                        <Menu.Item key="circleO">圆形</Menu.Item>
                        <Menu.Item key="ovalO">椭圆</Menu.Item>
                    </Menu.ItemGroup>
                    <Menu.ItemGroup title="其他">
                        <Menu.Item key="starO">五角星</Menu.Item>
                        <Menu.Item key="snowO">雪花</Menu.Item>
                        <Menu.Item key="sixsnowO">六边雪花</Menu.Item>
                        <Menu.Item key="linesnowO">线条雪花</Menu.Item>
                    </Menu.ItemGroup>
                </SubMenu>
                <Menu.Item key="setting">设置</Menu.Item>
            </Menu>
            <div className='draw-box' ref={boxRef}>
                <svg
                    className='svg-box'
                    onMouseDown={onmousedownsvg}
                    onMouseMove={onmousemove}
                    onMouseUp={onmouseup}
                    style={svgStyle}
                >
                    {
                        pictureArray.map((value, index)=>{
                            return (
                                <path
                                    key={index}
                                    onMouseDown={(e)=>{onmousedown(e,index)}}
                                    onClick={(e)=>{picClick(e,index)}}
                                    d={value.getPath()}
                                    style={{...value.style, ...value.tempStyle, ...pathStyle}}
                                />
                            )
                        })
                    }
                    {
                        pointArray.map((item, index)=>{
                            return(
                                <circle
                                    key={index}
                                    onMouseDown={(e)=>{!item.extra&&onmousedowncircle(e,index)}}
                                    onClick={()=>{pointClick(index)}}
                                    cx={item.x}
                                    cy={item.y}
                                    r={circleR}
                                    stroke="black"
                                    strokeWidth="1"
                                    fill="black"
                                    style={pointStyle}
                                />
                            )
                        })
                    }
                </svg>
                <div
                    className='smock'
                    style={style}
                    onMouseDown={drawMouseDown}
                    onMouseMove={drawMouseMove}
                    onMouseUp={drawMouseUp}
                ></div>
            </div>
        </div>
    )
}

export default Drawsvg