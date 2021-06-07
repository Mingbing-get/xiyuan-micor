import React from 'react';
import './index.css';

import {Table, Tooltip, Button, Input, Space, Popconfirm, message, Checkbox, Modal} from 'antd';
import { SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

import Getandcopy from '../../components/getandcopy';

import api from '../../http/api.js';

export default class Article extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            columns:[],
            dataSource:null,
            selectedRowKeys:[],
            selectedForbidKeys:[],
            selectedPublicKeys:[],
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

    //禁止一篇文章
    forbid = (id)=>{
        this.forbidorre([id], '禁止');
    };
    //解禁一篇文章
    reforbid = (id)=>{
        this.forbidorre([id], '发表');
    };
    forbidAll = ()=>{
        Modal.confirm({
            title: '确认禁止?',
            icon: <ExclamationCircleOutlined />,
            content: '确认将选择的所有文章禁止?',
            okText:'确定',
            onOk:() =>{
                this.forbidorre(this.state.selectedPublicKeys, '禁止');
            },
            cancelText:'取消',
        });
    };
    reForbidAll = ()=>{
        Modal.confirm({
            title: '确认解禁?',
            icon: <ExclamationCircleOutlined />,
            content: '确认将选择的所有文章解禁?',
            okText:'确定',
            onOk:() =>{
                this.forbidorre(this.state.selectedForbidKeys, '发表');
            },
            cancelText:'取消',
        });
    };
    getcounts = (callback)=>{
        let selectCountArray = [];
        this.filterForbid().forEach(value=>{
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
    //将禁止的选择框筛选出来
    filterForbid = ()=>{
        return this.state.selectedRowKeys.filter(value=>{
            let index = this.state.dataSource.findIndex(v=>v.id == value);
            return this.state.dataSource[index].status !== '草稿';
        });
    };
    //禁止和解禁某些文章
    forbidorre = (ids, status)=>{
        api.forbidarticle(JSON.stringify({id:ids.join(','), forbid:status}))
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    let dataSource = Array.from(this.state.dataSource, value=>{
                        let index = ids.findIndex(v=>v==value.id);
                        if (index === -1)
                            return value;
                        else
                            return {...value,status}
                    });
                    let selectedForbidKeys = [];
                    let selectedPublicKeys = [];
                    if (status === '禁止'){
                        if (ids.length===1){
                            selectedForbidKeys = [...this.state.selectedForbidKeys];
                            if (this.state.selectedPublicKeys.includes(ids[0])){
                                selectedForbidKeys.push(ids[0])
                            }
                            selectedPublicKeys = this.state.selectedPublicKeys.filter(item=>item !== ids[0]);
                        }
                        else {
                            selectedForbidKeys = [...this.state.selectedForbidKeys, ...this.state.selectedPublicKeys];
                        }
                    }
                    else if (status === '发表') {
                        if (ids.length===1){
                            selectedPublicKeys = [...this.state.selectedPublicKeys];
                            if (this.state.selectedForbidKeys.includes(ids[0])){
                                selectedPublicKeys.push(ids[0])
                            }
                            selectedForbidKeys = this.state.selectedForbidKeys.filter(item=>item !== ids[0]);
                        }
                        else {
                            selectedPublicKeys = [...this.state.selectedForbidKeys, ...this.state.selectedPublicKeys];
                        }
                    }
                    this.setState({
                        dataSource,
                        selectedForbidKeys,
                        selectedPublicKeys
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
        let selectedForbidKeys = [];
        let selectedPublicKeys = [];
        data.forEach(item=>{
            if (item.status === '禁止')
                selectedForbidKeys.push(item.id);
            else if (item.status === '发表')
                selectedPublicKeys.push(item.id);
        });
        this.setState({
            selectedRowKeys:e,
            selectedForbidKeys,
            selectedPublicKeys
        });
    };
    //渲染选择框
    renderCell=(checked, record, index, originNode)=>{
        return <Checkbox {...originNode.props} disabled={record.status==='草稿'}/>;
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
                if (key === 'lookuser'){
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
        api.getarticle(config)
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    let dataSource = Array.from(data.data,v=>{
                        v.key = v.id;
                        v.time = (new Date(v.time)).format('yyyy-MM-dd hh:mm:ss');
                        v.lookuser = this.etoc(v.lookuser);
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

    //转换可见性
    etoc = (e)=>{
        let c = '';
        switch (e) {
            case 'all' :
                c = '所有人';
                break;
            case 'onlyme' :
                c = '仅自己';
                break;
            case 'online' :
                c = '登录可见';
                break;
            default:
                c = e;
                break;
        }
        return c;
    };
    ctoe = (c)=>{
        let e = '';
        switch (c) {
            case '所有人' :
                e = 'all';
                break;
            case '仅自己' :
                e = 'onlyme';
                break;
            case '登录可见' :
                e = 'online';
                break;
            default:
                e = c;
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
                title: '标题',
                width: 100,
                dataIndex: 'title',
                key: 'title',
                fixed: 'left',
                ellipsis: {
                    showTitle: false,
                },
                render: title => (
                    <Tooltip placement="topLeft" title={title}>
                        {title}
                    </Tooltip>
                ),
            },
            {
                title: '发表人',
                width: 100,
                dataIndex: 'usercount',
                key: 'usercount',
                ...this.getColumnSearchProps('发表人'),
            },
            {
                title: '地址',
                width: 100,
                dataIndex: 'url',
                key: 'url',
            },
            {
                title: '描述',
                width: 150,
                dataIndex: 'discription',
                key: 'discription',
                ellipsis: {
                    showTitle: false,
                },
                render: discription => (
                    <Tooltip placement="topLeft" title={discription}>
                        {discription}
                    </Tooltip>
                ),
            },
            {
                title: '分类',
                width: 100,
                dataIndex: 'category',
                key: 'category',
                ...this.getColumnSearchProps('分类'),
            },
            {
                title: '状态',
                width: 100,
                dataIndex: 'status',
                key: 'status',
                ...this.getColumnSearchProps('状态'),
            },
            {
                title: '可见性',
                width: 100,
                dataIndex: 'lookuser',
                key: 'lookuser',
                ...this.getColumnSearchProps('可见性'),
            },
            {
                title: '发表时间',
                width: 150,
                dataIndex: 'time',
                key: 'time',
                sorter:true,
                defaultSortOrder:'descend',
                showSorterTooltip:false,
            },
            {
                title: '版本',
                width: 70,
                dataIndex: 'version',
                key: 'version',
                ...this.getColumnSearchProps('版本'),
            },
            {
                title: '点赞数',
                width: 80,
                dataIndex: 'likeCount',
                key: 'likeCount',
                sorter:true,
                showSorterTooltip:false,
            },
            {
                title: '评论数',
                width: 80,
                dataIndex: 'agumentCount',
                key: 'agumentCount',
                sorter:true,
                showSorterTooltip:false,
            },
            {
                title: '操作',
                key: 'action',
                width: 65,
                render: (text, record) => (
                    record.status!=='草稿'&&(record.status==='禁止'?
                        <Popconfirm
                            title="确认解禁该文章?"
                            onConfirm={() => this.reforbid(record.key)}
                            cancelText='取消'
                            okText='确定'
                        >
                            <Button
                                size='small'
                                type='primary'
                            >解禁</Button>
                        </Popconfirm>
                :
                    <Popconfirm
                        title="确认禁止该文章?"
                        onConfirm={() => this.forbid(record.key)}
                        cancelText='取消'
                        okText='确定'
                    >
                        <Button
                            size='small'
                            type='danger'
                        >禁止</Button>
                    </Popconfirm>)
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
                            onClick={this.forbidAll}
                            size='small'
                            type="danger"
                            disabled={this.state.selectedPublicKeys.length===0}
                        >
                            禁止所选
                        </Button>
                        <Button
                            onClick={this.reForbidAll}
                            size='small'
                            type="primary"
                            disabled={this.state.selectedForbidKeys.length===0}
                        >
                            解禁所选
                        </Button>
                    </div>
                </div>
                {
                    this.state.dataSource &&
                    <Table
                        columns={this.state.columns}
                        dataSource={this.state.dataSource}
                        scroll={{ x: 1295 }}
                        size='small'
                        rowSelection={{
                            selectedRowKeys:this.state.selectedRowKeys,
                            onChange:this.selectChange,
                            renderCell:this.renderCell,
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