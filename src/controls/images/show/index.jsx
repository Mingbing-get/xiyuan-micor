import React from 'react';
import './index.css';

import { Typography } from 'antd';

const { Title } = Typography;

class ShowImages extends React.Component {
    shouldComponentUpdate(newprops){
        if (this.props.data===newprops.data){
            return false;
        }
        return true;
    }
    render() {
        let data = [];
        let style = {};
        let title = '';
        let discription = '';
        let textAlign = 'center';
        if (this.props.data && this.props.data.cpdata){
            data = this.props.data.cpdata.path || [];
            style = this.props.data.cpdata.style || {};
            if (style.justify === 'flex-start')
                textAlign = 'left';
            if (style.justify === 'flex-end')
                textAlign = 'right';
            title = this.props.data.cpdata.title || '';
            discription = this.props.data.cpdata.discription || '';
        }
        return (
            <div>
                {
                    title &&
                    <Title level={5} style={{textAlign}}>{title}</Title>
                }
                <div
                    className='images-show-box'
                    style={{justifyContent:style.justify||'space-around'}}
                >
                    {
                        data.map((value, index) => {
                            return (
                                <img
                                    src={value}
                                    key={index}
                                    width={style.width||''}
                                    style={{borderRadius:style.radius+'px'||'', maxWidth:'100%'}}
                                />
                            )
                        })
                    }
                </div>
                {
                    discription &&
                        <p className='images-show-footer' style={{textAlign}}>{discription}</p>
                }
            </div>
        );
    }
}

ShowImages.elementName = 'ShowImages';
export default ShowImages;