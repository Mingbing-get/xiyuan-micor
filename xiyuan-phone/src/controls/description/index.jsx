import React from 'react';
import './index.css';

import { Descriptions } from 'antd';

class ShowDescription extends React.Component {
    shouldComponentUpdate(newprops){
        if (this.props.data===newprops.data){
            return false;
        }
        return true;
    }
    render() {
        let bordered = true;
        let layout = 'horizontal';
        let column = 3;
        let title = '';
        let descriptions = [];
        if (this.props.data && this.props.data.cpdata){
            if (this.props.data.cpdata.total){
                bordered = this.props.data.cpdata.total.border !== 'no-bordered';
                layout = this.props.data.cpdata.total.layout || layout;
                column = this.props.data.cpdata.total.column || column;
                title = this.props.data.cpdata.total.title || title;
            }
            descriptions = this.props.data.cpdata.descriptions || [];
        }
        return (
            <Descriptions bordered={bordered} layout={layout} column={column} title={title}>
                {
                    descriptions.map((value,index)=>{
                        return(
                            <Descriptions.Item key={index} label={value.label} span={value.span||1}>
                                {value.content}
                            </Descriptions.Item>
                        )
                    })
                }
            </Descriptions>
        );
    }
}

ShowDescription.elementName = 'ShowDescription';
export default ShowDescription;