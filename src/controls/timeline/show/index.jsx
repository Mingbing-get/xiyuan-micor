import React from 'react';
import './index.css';

import { Timeline } from 'antd';

class ShowTimeline extends React.Component {
    shouldComponentUpdate(newprops){
        if (this.props.data===newprops.data){
            return false;
        }
        return true;
    }
    render(){
        let justify = 'center';
        let width = null;
        let mode = 'default';
        let timeItems = [];
        if (this.props.data && this.props.data.cpdata){
            if (this.props.data.cpdata.style){
                width = this.props.data.cpdata.style.width || width;
                justify = this.props.data.cpdata.style.justify || justify;
                mode = this.props.data.cpdata.style.mode || mode;
            }
            timeItems = this.props.data.cpdata.timeItems || [];
        }
        return(
            <div className='timeline-show-box' style={{justifyContent:justify}}>
                <Timeline mode={mode==='default'?null:mode} style={{width:width, maxWidth:'100%'}}>
                    {
                        timeItems.map((value,index) => {
                            return(
                                <Timeline.Item
                                    label={value.label}
                                    key={index}
                                    dot={value.dot&&<b style={{color:value.color||'#1890ff'}}>{value.dot}</b>}
                                    color={value.color}
                                >
                                    {value.text}
                                </Timeline.Item>
                            )
                        })
                    }
                </Timeline>
            </div>
        );
    }
}

ShowTimeline.elementName='ShowTimeline';
export default ShowTimeline;