import React from 'react';
import './index.css';

import ShowSvg from './drawsvg/showsvg';

class ShowDrawSelf extends React.Component {
    shouldComponentUpdate(newprops){
        if (this.props.data===newprops.data){
            return false;
        }
        return true;
    }
    render(){
        let pictureArray = '[]';
        let pointArray = '[]';
        let bgc = '#ffffff';
        let height = 500;
        if (this.props.data && this.props.data.cpdata){
            const cpdata = this.props.data.cpdata;
            pictureArray = cpdata.pictureArray;
            pointArray = cpdata.pointArray;
            bgc = cpdata.backgroundColor;
            height = cpdata.height;
        }
        return(
            <ShowSvg
                pictureArray={pictureArray}
                pointArray={pointArray}
                backgroundColor={bgc}
                height={height}
                width={800}
            />
        );
    }
}

ShowDrawSelf.elementName='ShowDrawSelf';
export default ShowDrawSelf;