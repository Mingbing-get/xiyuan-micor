import React from 'react';
import './index.css';

import { Input } from 'antd';

class EdtSpace extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            space:null
        }
    }
    componentDidMount(){
        let space = null;
        if (this.props.data && this.props.data.cpdata){
            space = this.props.data.cpdata.space || null;
            this.setState({
                space
            });
        }
    };
    updateData = (newdata)=>{
        this.props.updateData &&
        this.props.updateData(this.props.index, {
            ...this.props.data,
            ...newdata
        });
    };
    updateSpace = (e)=>{
        if (e.target.value === ''){
            this.setState({
                space:null
            });
            this.updateData({cpdata:{space:''}});
        }
        else if (/^\d+$/.test(e.target.value)){
            let space = parseInt(e.target.value);
            this.setState({
                space
            });
            this.updateData({cpdata:{space}});
        }
    };
    render() {
        return (
            <div className='space-edt-box'>
                <Input
                    placeholder='请输入间距(px)'
                    value={this.state.space}
                    type='number'
                    onChange={this.updateSpace}
                />
            </div>
        );
    }
}

EdtSpace.showTitle = '间距';

export default EdtSpace;