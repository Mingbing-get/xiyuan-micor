import React from 'react';
import './index.css';

//引入echart模块
import echarts from 'echarts/lib/echarts';
//引入组件模块
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/pie';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/scatter';
//引入功能模块
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';

class ShowStatistic extends React.Component {
    constructor(props) {
        super(props);
        this.canvasRef = new React.createRef();
        this.myChart = null;
    }
    componentDidMount(){
        this.myChart = echarts.init(this.canvasRef.current);
        // 指定图表的配置项和数据
        if (this.props.data && this.props.data.cpdata){
            this.myChart.setOption(this.optionAdaptor(this.props.data.cpdata.option));
        }
    };
    shouldComponentUpdate(newprops){
        if (this.props.data===newprops.data){
            return false;
        }
        return true;
    }
    componentDidUpdate(){
        if (this.props.data && this.props.data.cpdata){
            this.myChart.clear();
            this.myChart.setOption(this.optionAdaptor(this.props.data.cpdata.option));
        }
        this.myChart.resize();//强制修改内部画布的大小
    }
    //解析option中的数据，以适配该图形
    optionAdaptor = (option)=>{
        if (!option)
            return {};
        let localOption = {...option};
        if (localOption.legend){
            let data = [];
            if (localOption.series){
                data = Array.from(localOption.series,v=>v.name);
            }
            localOption.legend = {data, top:30};
        }
        if (localOption.xAxis){
            let xAxis = {...localOption.xAxis};
            if (xAxis.data){
                xAxis.data = xAxis.data.replace(/，/g,',').split(',');
            }
            localOption.xAxis = xAxis;
        }
        if (localOption.series) {
            let series = Array.from(localOption.series,value=>{
                if (value.type !== 'pie' && !localOption.xAxis)
                    return ;
                let temp = {...value};
                if (temp.data){
                    temp.data = temp.data.replace(/，/g,',').split(',');
                    if (temp.type==='pie'){
                        let datatemp = [];
                        for (let i = 1; i < temp.data.length; i+=2){
                            datatemp.push({value:parseFloat(temp.data[i]),name:temp.data[i-1]});
                        }
                        temp.data = datatemp;
                        temp.top = 20;
                        if (localOption.legend){
                            temp.top = 50;
                            localOption.legend = {data:Array.from(datatemp,v=>v.name), top:30};
                        }
                    }
                    else if (temp.type==='scatter' && !localOption.xAxis.data){
                        let datatemp = [];
                        for (let i = 1; i < temp.data.length; i+=2){
                            datatemp.push([parseFloat(temp.data[i-1]),parseFloat(temp.data[i])]);
                        }
                        temp.data = datatemp;
                    }
                    else
                        temp.data = Array.from(temp.data, v=>parseFloat(v));
                }
                return temp;
            });
            localOption.series = series;
        }

        return localOption;
    };

    render() {
        let style = {};
        if (this.props.data && this.props.data.cpdata){
            style = this.props.data.cpdata.style || {};
        }
        return (
            <div style={{display:'flex', justifyContent:style.justify||'center'}}>
                <div ref={this.canvasRef}
                     style={{width: style.width||"100%",height:style.height||"300px", maxWidth:'100%'}}
                ></div>
            </div>
        );
    }
}

ShowStatistic.elementName='ShowStatistic';

export default ShowStatistic;