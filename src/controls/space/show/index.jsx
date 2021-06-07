import React from 'react';
import './index.css';

class ShowSpace extends React.Component {
    shouldComponentUpdate(newprops){
        if (this.props.data===newprops.data){
            return false;
        }
        return true;
    }
    render() {
        let space = 0;
        if (this.props.data && this.props.data.cpdata){
            space = this.props.data.cpdata.space || 0;
        }
        return (
            <div style={{paddingTop:space}}></div>
        );
    }
}

ShowSpace.elementName = 'ShowSpace';
export default ShowSpace;