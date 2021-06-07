import React from 'react';
import './index.css';

class ShowText extends React.Component {
    shouldComponentUpdate(newprops){
        if (this.props.data===newprops.data){
            return false;
        }
        return true;
    }
    render(){
        return(
            <div
                dangerouslySetInnerHTML={{__html: this.props.data && this.props.data.cpdata && this.props.data.cpdata.text}}
                className='show-text-box'
            >
            </div>
        );
    }
}

ShowText.elementName='ShowText';
export default ShowText;