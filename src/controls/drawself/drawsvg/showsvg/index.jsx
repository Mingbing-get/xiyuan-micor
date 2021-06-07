import React, { useState, useEffect } from 'react';
import './index.css';

import {ControlLine} from '../factsvg/controlPicture/controlLine.js';
import {ControlCircle} from '../factsvg/controlPicture/controlCircle.js';
import {ControlRect} from '../factsvg/controlPicture/controlRect.js';
import {ControlTriangle} from '../factsvg/controlPicture/controlTriangle.js';
import {ControlOval} from '../factsvg/controlPicture/controlOval.js';
import {ControlPolygon} from '../factsvg/controlPicture/controlPolygon.js';
import {ControlStar} from '../factsvg/controlPicture/controlStar.js';
import {ControlSnow} from '../factsvg/controlPicture/controlSnow.js';
import {ControlLineSnow} from '../factsvg/controlPicture/controlLineSnow.js';
import {ControlSixSnow} from '../factsvg/controlPicture/controlSixSnow.js';

function Showsvg(props) {
    const [pictureArray, setPictureArray] = useState([]);
    useEffect(()=>{
        let pointTemp = props.pointArray?JSON.parse(props.pointArray) : [];
        let picture = props.pictureArray?JSON.parse(props.pictureArray) : [];
        let picTemp = [];
        //第一次遍历所有的图形，创建对应的图形对象，但是不添加点到图形中
        picture.forEach(item=>{
            let pic = getPic(item.picname);
            pic.controlNum = item.controlNum;
            pic.theta = item.theta;
            pic.setStyle(item.style);
            picTemp.push(pic)
        });
        //第二次遍历所有的点，将这些点添加到对应的图形中
        pointTemp.forEach(item=>{
            item.control.forEach(value=>{
                picTemp[value.arrin].addPoint(item, value.pic);
            });
        });
        setPictureArray(picTemp);
    },[props.pointArray, props.pictureArray]);
    //根据不同的picname获取对应的图形对象
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
            case 'linesnow':
                pic = new ControlLineSnow();
                break;
            case 'sixsnow':
                pic = new ControlSixSnow();
                break;
            default:
                break;
        }
        return pic;
    }

    return (
        <div className='show-svg-scroll-box'>
            <svg
                className='show-svg-box'
                style={{backgroundColor:props.backgroundColor||'#fff', height:props.height||500, width:props.width||'100%'}}
            >
                {
                    pictureArray.map((value, index)=>{
                        return (
                            <path
                                key={index}
                                d={value.getPath()}
                                style={value.style}
                            />
                        )
                    })
                }
            </svg>
        </div>
    )
}

export default Showsvg