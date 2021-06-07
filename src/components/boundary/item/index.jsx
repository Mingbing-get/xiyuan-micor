import React from 'react';
import './index.css';

import ControlLine from '../controlLine';
import ControlLineHor from '../controlLineHor';

export default class Item extends React.Component {
    render(){
        return (
            this.props.direction==='vertical'?
                <div
                    className='boundary-item-box'
                    style={{...this.props.style, height:this.props.size+'%'}}
                >
                    {
                        !this.props.noControl &&
                        <ControlLineHor
                            location='bottom'
                            changeSize={this.props.changeSize}
                            changeComplete={this.props.changeComplete}
                        />
                    }
                    <div
                        className='boundary-item-content'
                        style={this.props.block?{height:'100%'}:{}}
                    >
                        {this.props.children}
                    </div>
                </div>
                :
                <div
                    className='boundary-item-box'
                    style={{...this.props.style, width:this.props.size+'%'}}
                >
                    {
                        !this.props.noControl &&
                        <ControlLine
                            location='right'
                            changeSize={this.props.changeSize}
                            changeComplete={this.props.changeComplete}
                        />
                    }
                    <div
                        className='boundary-item-content'
                        style={this.props.block?{height:'100%'}:{}}
                    >
                        {this.props.children}
                    </div>
                </div>
        )
    }
}