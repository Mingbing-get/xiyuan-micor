import React from 'react';
import './index.css';

import { Tooltip } from 'antd';
import { EditOutlined } from '@ant-design/icons';

export default class Dragbox extends React.Component {
    constructor(props){
        super(props);
    };
    drag = (e)=>{
        e.preventDefault();
        this.props.drag(this.props.component);
    };
    editClick = (e)=>{
        e.stopPropagation();
        this.props.showEdit && this.props.showEdit(this.props.component, this.props.groupname)
    };
    render(){
        return(
            <div
                draggable={true}
                onDrag={(e)=>{this.drag(e)}}
                className='drag-box'
            >
                <p>{this.props.children}</p>
                {
                    this.props.groupname !== '基础样式' &&
                    <Tooltip placement="top" title='编辑该样式'>
                        <EditOutlined onClick={this.editClick}/>
                    </Tooltip>
                }
            </div>
        );
    }
}