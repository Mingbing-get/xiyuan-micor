import React from 'react';
import './index.css';

export default class ControlLine extends React.Component {
    constructor(props) {
        super(props);
        this.controlRef = React.createRef();
        this.downLocation = -1;
        this.nowLocation = -3;
        this.state = {
            location:-3,
            width:1,
        }
    }

    onMouseDown = (e)=>{
        e.stopPropagation();
        this.downLocation = e.screenX;
        this.nowLocation = this.state.location-296;
        this.setState({
            width:599,
            location:this.nowLocation
        });
    };

    onMouseMove = (e)=>{
        e.stopPropagation();
        if (this.downLocation === -1)
            return;
        this.setState({
            location:this.props.location==='left'?this.nowLocation+(e.screenX-this.downLocation):this.nowLocation-(e.screenX-this.downLocation)
        });
        this.props.changeSize && this.props.changeSize(e.screenX-this.downLocation, ()=>{
            this.nowLocation = -3-296;
            this.downLocation = e.screenX;
            this.setState({
                location:this.nowLocation
            });
        });
    };

    onMouseUp = (e)=>{
        e.stopPropagation();
        this.setState({
            location:this.props.location==='left'?this.nowLocation+(e.screenX-this.downLocation):this.nowLocation-(e.screenX-this.downLocation)
        });
        this.props.changeComplete && this.props.changeComplete(e.screenX-this.downLocation);
        this.downLocation = -1;
        this.nowLocation = -3;
        this.setState({
            width:1,
            location:-3
        });
    };

    render() {
        const style = this.props.location === 'left'?{left:this.state.location+'px'}:{right:this.state.location+'px'};
        return (
            <div
                ref={this.controlRef}
                onMouseDown={this.onMouseDown}
                onMouseMove={this.onMouseMove}
                onMouseUp={this.onMouseUp}
                className={'control-line '+(this.props.className?this.props.className:'')}
                style={{...style, width:this.state.width}}
            >
                <div></div>
            </div>
        );
    }
}