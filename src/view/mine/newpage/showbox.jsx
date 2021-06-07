import React from 'react';
import {loadMicroApp} from 'qiankun';

export default class Showbox extends React.Component{
    constructor(props){
        super(props);
        this.rootRef = React.createRef();
        this.microApp = null;
    }
    componentDidMount(){
        this.microApp = loadMicroApp({
            name: this.props.micorkey+'show',
            entry: `/public/micor/${this.props.micorkey}/show/index.html`,
            container: this.rootRef.current,
            props: { data: this.props.data },
        });
    }
    componentDidUpdate(olddata) {
        if (!olddata || !olddata.data || !this.props.data || !this.props.data.cpdata) return;
        if (this.compare(olddata.data.cpdata, this.props.data.cpdata)) return;
        this.microApp && this.microApp.update({
            data: this.props.data
        });
    }
    componentWillUnmount() {
        if (this.microApp.getStatus() === 'MOUNTED'){
            this.microApp.unmount();
        }
        else {
            this.microApp.mountPromise
                .then(() => {
                    this.microApp.unmount();
                })
        }
    }
    compare(oldData, newData){
        if (!oldData && newData || oldData && !newData) return false;
        if (typeof oldData === 'object' ^ typeof newData === 'object') return false;
        if (oldData instanceof Array ^ newData instanceof Array) return false;
        if (typeof oldData !== 'object' && typeof  newData !== 'object') return oldData === newData;
        // 两个同时为object
        for(let key in oldData){
            if (!this.compare(oldData[key], newData[key])) return false;
        }
        for(let key in newData){
            if (!oldData.hasOwnProperty(key)) return false;
        }
        return true;
    }
    render() {
        return (
            <div ref={this.rootRef}></div>
        );
    }
}