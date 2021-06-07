import React from 'react';
import './index.css';

import { Spin } from 'antd';

export default class Loading extends React.Component {
    render() {
        return (
            <Spin
                className='loading-box'
                tip='加载中...'
            />
        );
    }
}