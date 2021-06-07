import React from 'react';
import './index.css';

import {Table, Tooltip, Button, Input, Space, Popconfirm, message, Modal} from 'antd';
import { SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

import Getandcopy from '../../components/getandcopy';

import api from '../../http/api.js';

export default class Feedback extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            columns:[],
            dataSource:null,
            selectedRowKeys:[],
            selectedNoResolve:[],
            current:1,
            total:0,
        }
    }

    componentDidMount(){
        this.setState({
            columns:this.initColumns()
        });
        this.serchData({page:1});
    };
    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }

    resovled = (id)=>{
        this.resovledto([id], '已解决');
    };
    resovledAll = ()=>{
        Modal.confirm({
            title: '确认已解决?',
            icon: <ExclamationCircleOutlined />,
            content: '确认将选择的所有标记为已解决?',
            okText:'确定',
            onOk:() =>{
                this.resovledto(this.state.selectedNoResolve, '已解决');
            },
            cancelText:'取消',
        });
    };
    getcounts = (callback)=>{
        let selectCountArray = [];
        this.state.selectedRowKeys.forEach(value=>{
            let index = this.state.dataSource.findIndex(v=>v.id==value);
            if (index === -1)
                return;
            let aindex = selectCountArray.findIndex(v=>v===this.state.dataSource[index].usercount);
            if (aindex === -1){
                selectCountArray.push(this.state.dataSource[index].usercount);
            }
        });
        callback(selectCountArray.join(','));
    };
    //禁止和解禁某些文章
    resovledto = (ids, status)=>{
        let admin = JSON.parse(sessionStorage.getItem('admin'));
        api.resovlefeedback(JSON.stringify({admincount:admin.count, id:ids.join(','), status}))
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    let dataSource = Array.from(this.state.dataSource, value=>{
                        let index = ids.findIndex(v=>v==value.id);
                        if (index === -1)
                            return value;
                        else
                            return {...value,status, ...data.data}
                    });
                    let selectedNoResolve = [];
                    if (ids.length===1){
                        selectedNoResolve = this.state.selectedNoResolve.filter(item=>item !== ids[0]);
                    }
                    this.setState({
                        dataSource,
                        selectedNoResolve
                    });
                    message.destroy();
                    message.success('操作成功!');
                }
                else {
                    message.destroy();
                    message.warning('操作失败!');
                }
            })
            .catch(error=>{
                message.destroy();
                message.warning('操作失败!');
            });
    };

    //改变选中
    selectChange = (e, data)=>{
        let selectedNoResolve = [];
        data.forEach(item=>{
            if (item.status === '待解决')
                selectedNoResolve.push(item.id);
        });
        this.setState({
            selectedRowKeys:e,
            selectedNoResolve
        });
    };
    //表的任何地方发生变化
    tableChange = (pagination, filters, sorter)=>{
        let config = {};
        //若是改变的页数，则以改变后的为准；若不是改变的页数，则表示过滤别的，需要将页数调整为1
        if (this.state.current === pagination.current)
            config.page = 1;
        else
            config.page = pagination.current;
        //看过滤的哪些有值，将有值的作为过滤条件
        for (let key in filters) {
            if (filters[key]) {
                if (key === 'type'){
                    let valueArray = filters[key][0].replace(/，/g,',').split(',');
                    valueArray = Array.from(valueArray, v=>this.ctoe(v));
                    config[key] = valueArray.join(',');
                }
                else
                    config[key] = filters[key][0];
            }
        }
        //看是否需要排序
        if (sorter.order){
            config.orderKey = sorter.columnKey;
            config.order = sorter.order==='descend'?'desc':'asc';
        }
        this.serchData(config);
    };
    //搜索数据
    serchData = (config)=>{
        api.getfeedback(config)
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    let dataSource = Array.from(data.data,v=>{
                        v.key = v.id;
                        v.sendtime = (new Date(v.sendtime)).format('yyyy-MM-dd hh:mm:ss');
                        if (v.resovletime)
                            v.resovletime = (new Date(v.resovletime)).format('yyyy-MM-dd hh:mm:ss');
                        v.type = this.etoc(v.type);
                        return v;
                    });
                    this.setState({
                        dataSource,
                        total:data.total,
                        current:config.page
                    });
                }
            })
            .catch(error=>{});
    };

    //转化类型
    etoc = (e)=>{
        let c = '';
        switch (e) {
            case 'problem':
                c = '网站问题';
                break;
            case 'error':
                c = '错误禁止';
                break;
            case 'advise':
                c = '发展建议';
                break;
            default:
                c=e;
                break;
        }
        return c;
    };
    ctoe = (c)=>{
        let e = '';
        switch (c) {
            case '网站问题':
                e = 'problem';
                break;
            case '错误禁止':
                e = 'error';
                break;
            case '发展建议':
                e = 'advise';
                break;
            default:
                e=c;
                break;
        }
        return e;
    };

    //自定义过滤方式和图标等
    getColumnSearchProps = title => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={node => {
                        this.searchInput = node;
                    }}
                    placeholder={`搜索 ${title}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => this.handleSearch(selectedKeys, confirm)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        搜索
                    </Button>
                    <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        重置
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => this.searchInput.select(), 100);
            }
        },
    });
    handleSearch = (selectedKeys, confirm) => {
        confirm();
    };
    handleReset = clearFilters => {
        clearFilters();
    };

    //初始化列名
    initColumns = ()=>{
        let columns = [
            {
                title: 'ID',
                width: 100,
                dataIndex: 'id',
                key: 'id',
                fixed: 'left',
            },
            {
                title: '发表人',
                width: 100,
                dataIndex: 'usercount',
                key: 'usercount',
                ...this.getColumnSearchProps('发表人'),
            },
            {
                title: '类型',
                width: 100,
                dataIndex: 'type',
                key: 'type',
                ...this.getColumnSearchProps('发表人'),
            },
            {
                title: '内容',
                width: 150,
                dataIndex: 'content',
                key: 'content',
                ellipsis: {
                    showTitle: false,
                },
                render: content => (
                    <Tooltip placement="topLeft" title={content}>
                        {content}
                    </Tooltip>
                ),
            },
            {
                title: '状态',
                width: 100,
                dataIndex: 'status',
                key: 'status',
                ...this.getColumnSearchProps('状态'),
            },
            {
                title: '发表时间',
                width: 150,
                dataIndex: 'sendtime',
                key: 'sendtime',
                sorter:true,
                defaultSortOrder:'descend',
                showSorterTooltip:false,
            },
            {
                title: '处理人',
                width: 100,
                dataIndex: 'admincount',
                key: 'admincount',
                ...this.getColumnSearchProps('处理人'),
            },
            {
                title: '处理时间',
                width: 150,
                dataIndex: 'resovletime',
                key: 'resovletime',
                sorter:true,
                showSorterTooltip:false,
            },
            {
                title: '操作',
                key: 'action',
                width: 65,
                render: (text, record) => (
                    record.status==='待解决'&&
                        <Popconfirm
                            title="确认标记为已解决?"
                            onConfirm={() => this.resovled(record.key)}
                            cancelText='取消'
                            okText='确定'
                        >
                            <Button
                                size='small'
                                type='primary'
                            >已解决</Button>
                        </Popconfirm>
                ),
                fixed:'right'
            },
        ];
        return columns;
    };
    render() {
        return (
            <div>
                <div className='btn-box'>
                    <Getandcopy
                        getcontent={this.getcounts}
                        disabled={this.state.selectedRowKeys.length===0}
                        btntext='获取所选账户'
                    />
                    <div>
                        <Button
                            onClick={this.resovledAll}
                            size='small'
                            type="primary"
                            disabled={this.state.selectedNoResolve.length===0}
                        >
                            标记所选
                        </Button>
                    </div>
                </div>
                {
                    this.state.dataSource &&
                    <Table
                        columns={this.state.columns}
                        dataSource={this.state.dataSource}
                        scroll={{ x: 1015 }}
                        size='small'
                        rowSelection={{
                            selectedRowKeys:this.state.selectedRowKeys,
                            onChange:this.selectChange,
                        }}
                        onChange={this.tableChange}
                        pagination={{
                            current:this.state.current,
                            hideOnSinglePage:true,
                            showSizeChanger:false,
                            defaultPageSize:15,
                            total:this.state.total
                        }}
                    />
                }
            </div>
        );
    }
}