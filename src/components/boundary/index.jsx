import React from 'react';
import './index.css';

import Item from './item';
import ControlLine from './controlLine';

class Boundary extends React.Component {
    constructor(props) {
        super(props);
        this.boundaryRef = React.createRef();
        this.fangdou = null;
        this.changeRight = false;
        this.state = {
            width:'',
            marginLeft:5,
            height:'',
            marginTop:5,
            childSize:[]
        }
    }

    componentDidMount(){
        this.updateProps(this.props);
    };

    shouldComponentUpdate(newprops){
        if (newprops.boundaryStyle!==this.props.boundaryStyle){
            this.updateProps(newprops);
        }
        if (!newprops.children || !this.props.children){
            this.updateProps(newprops);
        }
        else if (newprops.children.constructor !== Array && this.props.children.constructor !== Array){
            if (newprops.children.span !== this.props.children.props.span){
                this.updateProps(newprops);
            }
        }
        else if (newprops.children.length !== this.props.children.length){
            this.updateProps(newprops);
        }
        else {
            React.Children.map(newprops.children, (child, i)=>{
                if (child.props.span !== this.props.children[i].props.span){
                    this.updateProps(newprops);
                }
            });
        }
        return true;
    }

    //接收props
    updateProps = (props)=>{
        if (!props.children)
            return;
        //解析子节点的宽度比
        let childLength = props.children.length;
        let childSpan = new Array(childLength||1);
        let totalWidth = 0;
        let nowidth = 0;
        React.Children.map(props.children, (child, i)=>{
            if (child.props.span){
                let span = parseFloat(child.props.span);
                childSpan[i] = span;
                totalWidth = totalWidth+span;
            }
            else {
                nowidth++;
            }
        });
        let avg = (100-totalWidth)/nowidth;
        let childSize = Array.from(childSpan, span=>{
            if (span)
                return span;
            else
                return avg;
        });

        //解析自己的样式
        let boundaryStyle = props.boundaryStyle || {};
        this.setState({
            childSize,
            ...boundaryStyle
        });
    };

    //右边改变大小
    changeCompleteRight = (size)=>{
        let width = (this.boundaryRef.current.offsetWidth+size)/this.boundaryRef.current.parentElement.offsetWidth*100+'%';
        if (this.props.change){
            let boundaryStyle = {
                width,
                marginLeft:this.state.marginLeft,
                height:this.state.height,
                marginTop:this.state.marginTop
            };
            this.props.change(boundaryStyle, [...this.state.childSize]);
        }
        this.setState({
            width
        });
    };
    changeSizeRight = (size, callback)=>{
        if (this.changeRight){
            this.fangdou = null;
            this.changeRight = false;
            callback();
            this.setState({
                width:(this.boundaryRef.current.offsetWidth+size)/this.boundaryRef.current.parentElement.offsetWidth*100+'%'
            });
        }
        else if (!this.fangdou) {
            this.fangdou = setTimeout(()=>{
                this.changeRight = true;
            },this.props.time || 50);
        }
    };

    //左边改变大小
    changeCompleteLeft = (size)=>{
        let parentWidth = this.boundaryRef.current.parentElement.offsetWidth;
        let marginLeft = 5;
        if (this.state.marginLeft===5)
            marginLeft =(this.state.marginLeft+size)/parentWidth*100+'%';
        else {
            let factMargin = parseFloat(this.state.marginLeft)/100;
            marginLeft = (factMargin*parentWidth+size)/parentWidth*100+'%'
        }
        let width = (this.boundaryRef.current.offsetWidth+size)/parentWidth*100+'%';
        if (this.props.change){
            let boundaryStyle = {
                width,
                marginLeft,
                height:this.state.height,
                marginTop:this.state.marginTop
            };
            this.props.change(boundaryStyle, [...this.state.childSize]);
        }
        this.setState({
            width,
            marginLeft
        });
    };
    changeSizeLeft = (size, callback)=>{
        if (this.changeRight){
            this.fangdou = null;
            this.changeRight = false;
            callback();
            let parentWidth = this.boundaryRef.current.parentElement.offsetWidth;
            let marginLeft = 5;
            if (this.state.marginLeft===5)
                marginLeft =(this.state.marginLeft+size)/parentWidth*100+'%';
            else {
                let factMargin = parseFloat(this.state.marginLeft)/100;
                marginLeft = (factMargin*parentWidth+size)/parentWidth*100+'%'
            }
            this.setState({
                width:(this.boundaryRef.current.offsetWidth-size)/parentWidth*100+'%',
                marginLeft
            });
        }
        else if (!this.fangdou) {
            this.fangdou = setTimeout(()=>{
                this.changeRight = true;
            },this.props.time || 50);
        }
    };

    //改变子容器的大小
    changeCompleteChild = (index, size)=>{
        let allwidth = this.props.direction==='vertical'?this.boundaryRef.current.offsetHeight:this.boundaryRef.current.offsetWidth;
        let currentwidth = this.state.childSize[index]/100*allwidth;
        let nextwidth = this.state.childSize[index+1]/100*allwidth;

        let childSize = [...this.state.childSize.slice(0,index),(currentwidth+size)/allwidth*100,(nextwidth-size)/allwidth*100,...this.state.childSize.slice(index+2)];
        if (this.props.change){
            let boundaryStyle = {
                width:this.state.width,
                marginLeft:this.state.marginLeft,
                height:this.state.height,
                marginTop:this.state.marginTop
            };
            this.props.change(boundaryStyle, [...childSize]);
        }
        this.setState({
            childSize
        });
    };
    changeSizeChild = (index, size, callback)=>{
        if (this.changeRight){
            this.fangdou = null;
            this.changeRight = false;
            callback();
            let allwidth = this.props.direction==='vertical'?this.boundaryRef.current.offsetHeight:this.boundaryRef.current.offsetWidth;
            let currentwidth = this.state.childSize[index]/100*allwidth;
            let nextwidth = this.state.childSize[index+1]/100*allwidth;
            this.setState({
                childSize:[...this.state.childSize.slice(0,index),(currentwidth+size)/allwidth*100,(nextwidth-size)/allwidth*100,...this.state.childSize.slice(index+2)]
            });
        }
        else if (!this.fangdou) {
            this.fangdou = setTimeout(()=>{
                this.changeRight = true;
            },this.props.time || 50);
        }
    };
    render() {
        const childLength = this.props.children?this.props.children.length:-1;
        let height = {};
        let flexDirection = 'row';
        if (this.props.direction==='vertical'){
            height = {height:'100%', margin:0};
            flexDirection = 'column';
        }
        else if (this.props.direction==='horizontal'){
            height = {height:'100%', margin:0};
            flexDirection = 'row';
        }
        return (
            <div
                className='boundary-outer-box'
                style={height}
            >
                <div
                    ref={this.boundaryRef}
                    className='boundary-box'
                    style={{...this.props.style, width:this.state.width, marginLeft:this.state.marginLeft, ...height}}
                >
                    {
                        !this.props.direction &&
                        <React.Fragment>
                            <ControlLine
                                location='left'
                                changeSize={this.changeSizeLeft}
                                changeComplete={this.changeCompleteLeft}
                            />
                            <ControlLine
                                location='right'
                                changeSize={this.changeSizeRight}
                                changeComplete={this.changeCompleteRight}
                            />
                        </React.Fragment>

                    }
                    <div
                        className={this.props.noborder?'boundary-content noborder':'boundary-content'}
                        style={{...height, flexDirection}}>
                        {
                            childLength!==-1 && (childLength?
                            React.Children.map(this.props.children, (child, i)=>{
                                if (childLength === i+1)
                                    return <Item {...child.props} size={this.state.childSize[i]} direction={this.props.direction} noControl={true}/>;
                                return (
                                    <Item
                                        {...child.props}
                                        size={this.state.childSize[i]}
                                        direction={this.props.direction}
                                        changeSize={(size, callback)=>{this.changeSizeChild(i, size, callback)}}
                                        changeComplete={(size)=>{this.changeCompleteChild(i, size)}}
                                    />
                                );
                            })
                                :
                                <Item {...this.props.children.props} size={this.state.childSize[0]} direction={this.props.direction} noControl={true}/>
                            )
                        }
                    </div>
                </div>
            </div>
        );
    }
}

Boundary.Item = Item;

export default Boundary;