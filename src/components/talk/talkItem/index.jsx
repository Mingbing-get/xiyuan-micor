import React from 'react';
import './index.css';

export default function TalkItem({...props}) {
    return (
        <div
            className={props.data.displayRight?'talk-item talk-item-right':'talk-item'}
        >
            <div className='talk-item-header' style={{backgroundImage:'url('+props.data.image+')'}}></div>
            <div className='talk-item-main'>
                <p className='talk-item-time'>
                    {props.data.time}
                </p>
                <div className='talk-item-content'>
                    {props.data.content}
                </div>
            </div>
        </div>
    );
}