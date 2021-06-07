import React from 'react';
import './index.css';

import Sarousel from './sarousel';

class ShowCarousel extends React.Component {
    shouldComponentUpdate(newprops){
        if (this.props.data===newprops.data){
            return false;
        }
        return true;
    }
    render() {
        let justify = 'center';
        let width = '100%';
        let bili = 2;
        let showPoint = false;
        let showMove = false;
        let autoCircular = false;
        let time = 5000;
        let dataArray = [];
        if (this.props.data && this.props.data.cpdata){
            const cpdata = this.props.data.cpdata;
            if (cpdata.style){
                justify = cpdata.style.justify||justify;
                width = cpdata.style.width?cpdata.style.width+'px':width;
                bili = cpdata.style.bili||bili;
            }
            if (cpdata.option){
                showPoint = cpdata.option.showPoint || showPoint;
                showMove = cpdata.option.showMove || showMove;
                autoCircular = !!cpdata.option.autoCircular;
                time = (cpdata.option.autoCircular&&cpdata.option.autoCircular.time) || time;
            }
            dataArray = cpdata.dataArray || dataArray;
        }
        return (
            <div className='carousel-show-box' style={{justifyContent:justify}}>
                <Sarousel
                    style={{maxWidth:'100%', width}}
                    showPoint={showPoint}
                    showMove={showMove}
                    autoCircular={autoCircular}
                    time={time}
                    bili={bili}
                >
                    {
                        dataArray.map((value, index)=>{
                            return (
                                <div
                                    className='carousel-slide-box'
                                    key={index}
                                    style={{height:'100%',
                                        backgroundColor:value.bgColor||'#fff',
                                        paddingTop:value.marginTop,
                                        backgroundImage:'url('+(value.backgroundImage?value.backgroundImage.path:'')+')'}}
                                >
                                    <p
                                        style={{color:value.textColor||'#000'}}
                                    >{value.text}</p>
                                </div>
                            )
                        })
                    }
                </Sarousel>
            </div>
        );
    }
}

ShowCarousel.elementName = 'ShowCarousel';
export default ShowCarousel;