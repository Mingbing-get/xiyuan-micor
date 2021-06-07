import React from 'react';
import './index.css';

import { LeftOutlined, RightOutlined } from '@ant-design/icons';

export default class Sarouel extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            currentIndex:1,
            pointIndex:0,
            dingshi:null,

            touchstart:0,
            touchloaction:0,

            time:props.time||5000,
            height:'100%'
        };
        this.imgBox = React.createRef();
    }

    componentDidMount(){
        //绑定动画完成的事件
        this.imgBox.current.addEventListener(this.whichTransitionEvent(), ()=>{
            if (this.state.currentIndex > this.props.children.length){
                this.setState({
                    currentIndex:1
                });
                this.imgBox.current.style.transition = null;
                this.moveBox(1);
            }
            else if (this.state.currentIndex <= 0){
                this.setState({
                    currentIndex:this.props.children.length
                });
                this.imgBox.current.style.transition = null;
                this.moveBox(this.props.children.length);
            }
        });
        //绑定手指触碰事件
        if (this.props.touchEvent !== false){
            this.imgBox.current.addEventListener('touchstart', (e)=>{
                clearInterval(this.state.dingshi);
                this.setState({
                    touchstart:e.changedTouches[0].screenX
                });
            });
            this.imgBox.current.addEventListener('touchend', (e)=>{
                this.setState({
                    dingshi:this.props.autoCircular===false?null:this.setdingshiqi(),
                    touchloaction:e.changedTouches[0].screenX
                });
                if (Math.abs(this.state.touchstart-this.state.touchloaction) >= this.imgBox.current.children[0].clientWidth/4){
                    this.imgBox.current.style.transition = 'all 0.4s linear';
                    let currentIndex = 0;
                    if (this.state.touchstart>this.state.touchloaction){
                        currentIndex = (this.state.currentIndex+1)%(this.props.children.length+2);
                        this.setState({
                            currentIndex,
                            pointIndex:currentIndex>this.props.children.length?0:currentIndex-1
                        });
                    }
                    else {
                        currentIndex = this.state.currentIndex-1;
                        this.setState({
                            currentIndex,
                            pointIndex:currentIndex===0?this.props.children.length-1:currentIndex-1
                        });
                    }
                    this.moveBox(currentIndex);
                }
            });
        }
        //初始化轮播
        this.moveBox(this.state.currentIndex);
        //初始化自动轮播
        if (this.props.autoCircular === false){
            return;
        }
        //定义定时器
        this.state.dingshi = this.setdingshiqi();
        //绑定大小改变的事件
        this.addResizeEvent();
    }

    shouldComponentUpdate(newprops){
        if (newprops.autoCircular && !this.props.autoCircular){
            this.state.dingshi = this.setdingshiqi();
        }
        else if (!newprops.autoCircular && this.props.autoCircular){
            clearInterval(this.state.dingshi);
        }
        if (newprops.time !== this.props.time){
            clearInterval(this.state.dingshi);
            this.state.dingshi = this.setdingshiqi(newprops.time);
        }
        if (newprops.bili !== this.props.bili){
            this.getHeight(this.imgBox.current.parentNode.offsetWidth, newprops.bili);
        }
        return true;
    };

    componentWillUnmount(){
        clearInterval(this.state.dingshi);
    }

    //添加大小改变的事件
    addResizeEvent = ()=>{
        let showArea = this.imgBox.current;
        let iframe = showArea.parentNode.getElementsByTagName('iframe')[0];
        this.getHeight(showArea.parentNode.offsetWidth);
        (iframe.contentWindow || iframe).onresize = (e) => {
            this.getHeight(e.target.innerWidth);
        }
    };

    //按比例计算高
    getHeight = (width, bili)=>{
        bili = bili || this.props.bili || 2;
        let height = Math.floor(width/bili);
        if (height !== this.state.height){
            this.setState({
                height
            });
        }
    };

    clickLeft = (e)=>{
        e.stopPropagation();
        //重置定时器
        if (this.props.autoCircular !== false){
            this.state.dingshi = this.setdingshiqi();
        }
        this.imgBox.current.style.transition = 'all 0.4s linear';
        let currentIndex = this.state.currentIndex-1;
        this.setState({
            currentIndex,
            pointIndex:currentIndex===0?this.props.children.length-1:currentIndex-1
        });
        this.moveBox(currentIndex);
    };

    clickRight = (e)=>{
        e.stopPropagation();
        //重置定时器
        if (this.props.autoCircular !== false){
            this.state.dingshi = this.setdingshiqi();
        }
        this.imgBox.current.style.transition = 'all 0.4s linear';
        let currentIndex = (this.state.currentIndex+1)%(this.props.children.length+2);
        this.setState({
            currentIndex,
            pointIndex:currentIndex>this.props.children.length?0:currentIndex-1
        });
        this.moveBox(currentIndex);
    };

    clickPoint = (e, index)=>{
        e.stopPropagation();
        this.setState({
            dingshi:this.props.autoCircular===false?null:this.setdingshiqi(),
            currentIndex:index+1,
            pointIndex:index,
        });
        this.imgBox.current.style.transition = 'all 0.4s linear';
        this.moveBox(index+1);
    };

    //定义动画执行完成的回调函数
    whichTransitionEvent(){
        var t;
        var el = document.createElement('fakeelement');
        var transitions = {
            'transition':'transitionend',
            'OTransition':'oTransitionEnd',
            'MozTransition':'transitionend',
            'WebkitTransition':'webkitTransitionEnd'
        };

        for(t in transitions){
            if( el.style[t] !== undefined ){
                return transitions[t];
            }
        }
    };

    moveBox = (index)=>{
        this.imgBox.current.style.transform = 'translateX('+(-this.imgBox.current.children[0].clientWidth*index)+'px)';
    };

    setdingshiqi = (time)=>{
        clearInterval(this.state.dingshi);
        return setInterval(()=>{
            this.imgBox.current.style.transition = 'all 0.4s linear';
            let currentIndex = (this.state.currentIndex+1)%(this.props.children.length+2);
            this.setState({
                currentIndex,
                pointIndex:currentIndex>this.props.children.length?0:currentIndex-1
            });
            this.moveBox(currentIndex);
        },time||this.state.time);
    };

    render(){
        if (!this.props.children)
            return;
        const length = this.props.children.length || 1;
        return (
            <div className='sarousel' style={{height:this.state.height, ...this.props.style}}>
                <iframe></iframe>
                <ul className='img-box' style={{width: (length+2) * 100 + '%'}} ref={this.imgBox}>
                    <li style={{width: 100 / (length+2) + '%'}}>
                        {this.props.children[length-1]}
                    </li>
                    {
                        React.Children.map(this.props.children, (child, i)=>{
                            return (
                                <li style={{width: 100 / (length+2) + '%'}}>
                                    {child}
                                </li>
                            );
                        })
                    }
                    <li style={{width: 100 / (length+2) + '%'}}>
                        {this.props.children[0]}
                    </li>
                </ul>
                {
                    this.props.showPoint !== false ?
                        (<ul className='point-box'>
                            {new Array(length).fill(1).map((item, index) => {
                                return (
                                    <li key={index}>
                                        <a className={index === this.state.pointIndex ? 'active' : ''} onClick={(e)=>{this.clickPoint(e, index)}}></a>
                                    </li>
                                );
                            })}
                        </ul>)
                        :
                        ''
                }
                {
                    this.props.showMove !== false ?
                        (<div>
                            <LeftOutlined
                                className='move-left'
                                onClick={this.clickLeft}
                            />
                            <RightOutlined
                                className='move-right'
                                onClick={this.clickRight}
                            />
                        </div>)
                        :
                        ''
                }
            </div>
        );
    };
}