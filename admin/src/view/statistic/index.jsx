import React from 'react';
import './index.css';

import { message, Button } from 'antd';
//引入echart模块
import echarts from 'echarts/lib/echarts';
//引入组件模块
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/pie';
//引入功能模块
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/dataZoom';
import 'echarts/lib/component/toolbox';
import 'echarts/lib/component/grid';

import api from '../../http/api.js';

export default class Statistic extends React.Component {
    constructor(props) {
        super(props);
        this.canvasRef = new React.createRef();
        this.myChart = null;
        this.state = {
            current:'stuserinfo'
        }
    }
    componentDidMount(){
        this.myChart = echarts.init(this.canvasRef.current);
        this.stuserinfo();
    };
    //获取用户基本信息
    stuserinfo = ()=>{
        this.getDtata(api.stuserinfo, (data)=>{
            let opdata = {
                xname:'生日(区间)',
                xdata:['<80','80~90','90~00','00~10','10~20','>20'],
                yname:'人数',
                ydata:new Array(6).fill(0)
            };
            let pie = {man:0, woman:0};
            data.forEach(value=>{
                if (value.sex==='男'){
                    pie.man++;
                }
                else {
                    pie.woman++;
                }
                let year = new Date(value.birthday).getFullYear();
                let cha = year-1980;
                if (cha < 0){
                    opdata.ydata[0]++;
                }
                else if (cha > 40){
                    opdata.ydata[5]++;
                }
                else {
                    opdata.ydata[Math.ceil(cha/10)]++;
                }
            });
            let seriespie = {
                type:"pie",
                data:[{name:'男：'+pie.man,value:pie.man},{name:'女：'+pie.woman,value:pie.woman}],
                height:260
            };
            this.draw('用户性别比和生日统计',opdata,seriespie, 240);
            this.setState({
                current:'stuserinfo'
            });
        });
    };
    //获取用户评论数
    stuseragument = ()=>{
        this.getDtata(api.stuseragument,(data)=>{
            let temp = {};
            data.forEach(value=>{
                if (!temp[value.count])
                    temp[value.count] = 1;
                else
                    temp[value.count]++;
            });
            let opdata = {
                xname:'评论数',
                xdata:Object.keys(temp),
                yname:'人数',
                ydata:Object.values(temp)
            };
            this.draw('用户发表的评论数',opdata);
            this.setState({
                current:'stuseragument'
            });
        });
    };
    //获取用户关注数
    stuserfollow = ()=>{
        this.getDtata(api.stuserfollow,(data)=>{
            let temp = {};
            data.forEach(value=>{
                if (!temp[value.count])
                    temp[value.count] = 1;
                else
                    temp[value.count]++;
            });
            let opdata = {
                xname:'关注数',
                xdata:Object.keys(temp),
                yname:'人数',
                ydata:Object.values(temp)
            };
            this.draw('用户关注的人数',opdata);
            this.setState({
                current:'stuserfollow'
            });
        });
    };
    //获取用户被关注数
    stuserbyfollow = ()=>{
        this.getDtata(api.stuserbyfollow,(data)=>{
            let temp = {};
            data.forEach(value=>{
                if (!temp[value.count])
                    temp[value.count] = 1;
                else
                    temp[value.count]++;
            });
            let opdata = {
                xname:'被关注数',
                xdata:Object.keys(temp),
                yname:'人数',
                ydata:Object.values(temp)
            };
            this.draw('用户被关注的人数',opdata);
            this.setState({
                current:'stuserbyfollow'
            });
        });
    };
    //获取用户点赞数
    stuserlike = ()=>{
        this.getDtata(api.stuserlike,(data)=>{
            let temp = {};
            data.forEach(value=>{
                if (!temp[value.count])
                    temp[value.count] = 1;
                else
                    temp[value.count]++;
            });
            let opdata = {
                xname:'点赞数',
                xdata:Object.keys(temp),
                yname:'人数',
                ydata:Object.values(temp)
            };
            this.draw('用户点赞数',opdata);
            this.setState({
                current:'stuserlike'
            });
        });
    };
    //获取用户文章数
    stuserpage = ()=>{
        this.getDtata(api.stuserpage,(data)=>{
            let temp = {};
            data.forEach(value=>{
                if (!temp[value.count])
                    temp[value.count] = 1;
                else
                    temp[value.count]++;
            });
            let opdata = {
                xname:'文章数',
                xdata:Object.keys(temp),
                yname:'人数',
                ydata:Object.values(temp)
            };
            this.draw('用户发表的文章数',opdata);
            this.setState({
                current:'stuserpage'
            });
        });
    };

    //获取文章信息
    stpageinfo = ()=>{
        this.getDtata(api.stpageinfo,(data)=>{
            let status = {};
            let lookuser = {};
            let category = {};
            data.forEach(value=>{
                if (!status[value.status])
                    status[value.status] = 1;
                else
                    status[value.status]++;

                if (!lookuser[value.lookuser])
                    lookuser[value.lookuser] = 1;
                else
                    lookuser[value.lookuser]++;

                if (!category[value.category])
                    category[value.category] = 1;
                else
                    category[value.category]++;
            });
            let piestatus = {
                type:'pie',
                data:[],
                name:'状态',
                radius: ['20%','40%'],
                center: ['50%', '30%'],
            };
            for (let key in status){
                piestatus.data.push({name:key, value:status[key]});
            }
            let pielookuser = {
                type:'pie',
                data:[],
                name:'谁可见',
                radius: ['20%','40%'],
                center: ['23%', '77%']
            };
            for (let key in lookuser){
                pielookuser.data.push({name:this.etoc(key), value:lookuser[key]});
            }
            let piecategory = {
                type:'pie',
                data:[],
                name:'分类',
                radius: ['20%','40%'],
                center: ['77%', '77%']
            };
            for (let key in category){
                piecategory.data.push({name:key, value:category[key]});
            }
            this.drawpies('文章的基本信息对比',[piestatus,pielookuser,piecategory]);
            // this.draw('用户发表的文章数',opdata);
            this.setState({
                current:'stpageinfo'
            });
        });
    };
    //获取文章评论数
    stpageagument = ()=>{
        this.getDtata(api.stpageagument,(data)=>{
            let temp = {};
            data.forEach(value=>{
                if (!temp[value.count])
                    temp[value.count] = 1;
                else
                    temp[value.count]++;
            });
            let opdata = {
                xname:'评论数',
                xdata:Object.keys(temp),
                yname:'文章数',
                ydata:Object.values(temp)
            };
            this.draw('文章的评论数',opdata);
            this.setState({
                current:'stpageagument'
            });
        });
    };
    //获取文章点赞数
    stpagelike = ()=>{
        this.getDtata(api.stpagelike,(data)=>{
            let temp = {};
            data.forEach(value=>{
                if (!temp[value.count])
                    temp[value.count] = 1;
                else
                    temp[value.count]++;
            });
            let opdata = {
                xname:'点赞数',
                xdata:Object.keys(temp),
                yname:'文章数',
                ydata:Object.values(temp)
            };
            this.draw('文章的点赞数',opdata);
            this.setState({
                current:'stpagelike'
            });
        });
    };

    //获取组件数据
    stcomponent = ()=>{
        this.getDtata(api.stcomponent,(data)=>{
            let component = Array.from(data, value=>{
                return {name:value.micorname, value:value.count};
            });
            let piecomponent = {
                type:'pie',
                data:component,
                name:'组件',
                radius: [0,'60%'],
                center: ['50%', '50%'],
            };
            this.drawpies('各个组件的使用比例',[piecomponent]);
            // this.draw('用户发表的文章数',opdata);
            this.setState({
                current:'stcomponent'
            });
        });
    };

    //将lookuser的键转化成中文
    etoc = (e)=>{
        const dictionary = {
            all:'所有人',
            onlyme:'仅自己',
            online:'登录可见',
        };
        return dictionary[e] || e;
    };
    //画多个饼图
    drawpies = (title, series)=>{
        let option = {
            title: {
                text: title,
                left:40
            },
            toolbox: {
                feature: {
                    dataZoom: {
                        yAxisIndex: false
                    },
                    saveAsImage: {
                        pixelRatio: 2
                    }
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            series: series
        };
        this.myChart.clear();
        this.myChart.setOption(option);
    };
    //去数据库获取数据，使用传入的函数获取，获取成功后执行回调函数
    getDtata = (getfunction, callback)=>{
        getfunction()
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    callback(data.data);
                    message.destroy();
                    message.success('获取数据成功');
                }
                else {
                    message.destroy();
                    message.warning('获取数据失败');
                }
            })
            .catch(error=>{
                console.log(error);
                message.destroy();
                message.warning('获取数据失败');
            });
    };
    //画出图形
    draw = (title,data, pie, top)=>{
        let option = {
            title: {
                text: title,
                left:40
            },
            toolbox: {
                feature: {
                    dataZoom: {
                        yAxisIndex: false
                    },
                    saveAsImage: {
                        pixelRatio: 2
                    }
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            grid: {
                top: top || 60,
                height: 350
            },
            dataZoom: [{
                type: 'inside'
            }, {
                bottom: top?0:170,
                type: 'slider'
            }],
            xAxis: {
                data: data.xdata,
                name: data.xname || 'x轴',
                silent: false,
                splitLine: {
                    show: false
                },
                splitArea: {
                    show: false
                }
            },
            yAxis: {
                name: data.yname || 'y轴',
                splitArea: {
                    show: false
                }
            },
            series: [{
                type: 'bar',
                data: data.ydata,
                large: true
            }]
        };
        if (pie){
            option.series.push(pie);
        }
        this.myChart.clear();
        this.myChart.setOption(option);
    };
    render() {
        return (
            <div className='statistic-admin-box'>
                <div className='btn-box'>
                    <Button
                        type='primary'
                        onClick={this.stuserinfo}
                        disabled={this.state.current === 'stuserinfo'}
                    >用户信息</Button>
                    <Button
                        type='primary'
                        onClick={this.stuseragument}
                        disabled={this.state.current === 'stuseragument'}
                    >用户评论</Button>
                    <Button
                        type='primary'
                        onClick={this.stuserfollow}
                        disabled={this.state.current === 'stuserfollow'}
                    >用户关注</Button>
                    <Button
                        type='primary'
                        onClick={this.stuserbyfollow}
                        disabled={this.state.current === 'stuserbyfollow'}
                    >用户被关注</Button>
                    <Button
                        type='primary'
                        onClick={this.stuserlike}
                        disabled={this.state.current === 'stuserlike'}
                    >用户点赞</Button>
                    <Button
                        type='primary'
                        onClick={this.stuserpage}
                        disabled={this.state.current === 'stuserpage'}
                    >用户文章</Button>
                    <Button
                        type='primary'
                        onClick={this.stpageinfo}
                        disabled={this.state.current === 'stpageinfo'}
                    >文章信息</Button>
                    <Button
                        type='primary'
                        onClick={this.stpageagument}
                        disabled={this.state.current === 'stpageagument'}
                    >文章评论</Button>
                    <Button
                        type='primary'
                        onClick={this.stpagelike}
                        disabled={this.state.current === 'stpagelike'}
                    >文章点赞</Button>
                    <Button
                        type='primary'
                        onClick={this.stcomponent}
                        disabled={this.state.current === 'stcomponent'}
                    >组件使用比例</Button>
                </div>
                <div ref={this.canvasRef} style={{width: 800, height:650}}></div>
            </div>
        );
    }
}