import React from 'react'

export default class Empty extends React.Component {
    componentDidMount(){
        if (this.props.history.action.toLowerCase()==='pop'){
            this.props.history.goBack();
        }
    }
    render() {
        return (
            <div></div>
        );
    }
}