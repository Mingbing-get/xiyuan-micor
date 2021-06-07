import React from 'react';
import './index.css';

import { Divider } from 'antd';

class ShowDivider extends React.Component {
    shouldComponentUpdate(newprops){
        if (this.props.data===newprops.data){
            return false;
        }
        return true;
    }
    render() {
        let plain = true;
        let dashed = false;
        let orientation = 'center';
        if (this.props.data && this.props.data.cpdata && this.props.data.cpdata.style){
            plain = this.props.data.cpdata.style.weight==='normal';
            dashed = this.props.data.cpdata.style.type==='dashed';
            orientation = this.props.data.cpdata.style.orientation;
        }
        return (
            <Divider
                plain={plain}
                dashed={dashed}
                orientation={orientation}
            >
                {this.props.data && this.props.data.cpdata && this.props.data.cpdata.text}
            </Divider>
        );
    }
}

ShowDivider.elementName = 'ShowDivider';
export default ShowDivider;