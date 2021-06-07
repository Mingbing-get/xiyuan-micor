import React from 'react';
import './index.css';

export default class ControlLineHor extends React.Component {
    constructor(props) {
        super(props);
        this.controlRef = React.createRef();
        this.downLocation = -1;
        this.nowLocation = -3;
        this.state = {
            location:-3,
            paddingTop:3,
        }
    }

    onMouseDown = (e)=>{
        e.stopPropagation();
        this.downLocation = e.screenY;
        this.nowLocation = this.state.location-296;
        this.setState({
            paddingTop:300,
            location:this.nowLocation
        });
    };

    onMouseMove = (e)=>{
        e.stopPropagation();
        if (this.downLocation === -1)
            return;
        this.setState({
            location:this.props.location==='top'?this.nowLocation+(e.screenY-this.downLocation):this.nowLocation-(e.screenY-this.downLocation)
        });
        this.props.changeSize && this.props.changeSize(e.screenY-this.downLocation, ()=>{
            this.nowLocation = -3-296;
            this.downLocation = e.screenY;
            this.setState({
                location:this.nowLocation
            });
        });
    };

    onMouseUp = (e)=>{
        e.stopPropagation();
        this.setState({
            location:this.props.location==='top'?this.nowLocation+(e.screenY-this.downLocation):this.nowLocation-(e.screenY-this.downLocation)
        });
        this.props.changeComplete && this.props.changeComplete(e.screenY-this.downLocation);
        this.downLocation = -1;
        this.nowLocation = -3;
        this.setState({
            paddingTop:3,
            location:-3
        });
    };

    render() {
        const style = this.props.location === 'top'?{top:this.state.location+'px'}:{bottom:this.state.location+'px'};
        return (
            <div
                ref={this.controlRef}
                onMouseDown={this.onMouseDown}
                onMouseMove={this.onMouseMove}
                onMouseUp={this.onMouseUp}
                className={'control-line-hor '+(this.props.className?this.props.className:'')}
                style={{...style, padding:this.state.paddingTop+'px 0'}}
            >
                <div></div>
            </div>
        );
    }
}