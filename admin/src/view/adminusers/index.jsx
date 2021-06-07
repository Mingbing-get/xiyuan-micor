import React from 'react';
import './index.css';

import {Table, Button, Input, Space, Popconfirm, message, Modal } from 'antd';
import { SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

import Addadmin from './addadmin';
import {EditableRow, EditableCell} from '../../components/editable';

import api from '../../http/api.js';

export default class AdminUsers extends React.Component {
    constructor(props) {
        super(props);
        this.admin = JSON.parse(sessionStorage.getItem('admin'));
        this.state = {
            columns:[],
            dataSource:null,
            selectedRowKeys:[],
            selectedForbidKeys:[],
            selectedPublicKeys:[],
            current:1,
            total:0,
            levelVisible:false,
            levelText:''
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
    forbid = (count)=>{
        this.forbidorre([count], '禁止');
    };
    //解禁一篇文章
    reforbid = (count)=>{
        this.forbidorre([count], '可使用');
    };
    forbidAll = ()=>{
        Modal.confirm({
            title: '确认禁止?',
            icon: <ExclamationCircleOutlined />,
            content: '确认将选择的所有管理员禁止?',
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
            content: '确认将选择的所有管理员解禁?',
            okText:'确定',
            onOk:() =>{
                this.forbidorre(this.state.selectedForbidKeys, '可使用');
            },
            cancelText:'取消',
        });
    };
    //禁止和解禁某些文章
    forbidorre = (counts, status)=>{
        api.forbidadmin(JSON.stringify({count:counts.join(','), status}))
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    let dataSource = Array.from(this.state.dataSource, value=>{
                        let index = counts.findIndex(v=>v==value.count);
                        if (index === -1)
                            return value;
                        else
                            return {...value,status}
                    });
                    let selectedForbidKeys = [];
                    let selectedPublicKeys = [];
                    if (status === '禁止'){
                        if (counts.length===1){
                            selectedForbidKeys = [...this.state.selectedForbidKeys];
                            if (this.state.selectedPublicKeys.includes(counts[0])){
                                selectedForbidKeys.push(counts[0])
                            }
                            selectedPublicKeys = this.state.selectedPublicKeys.filter(item=>item !== counts[0]);
                        }
                        else {
                            selectedForbidKeys = [...this.state.selectedForbidKeys, ...this.state.selectedPublicKeys];
                        }
                    }
                    else if (status === '可使用') {
                        if (counts.length===1){
                            selectedPublicKeys = [...this.state.selectedPublicKeys];
                            if (this.state.selectedForbidKeys.includes(counts[0])){
                                selectedPublicKeys.push(counts[0])
                            }
                            selectedForbidKeys = this.state.selectedForbidKeys.filter(item=>item !== counts[0]);
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

    handleSave = (row)=>{
        if (!row.level)
            return;
        let index = this.state.dataSource.findIndex(v=>v.count===row.count);
        if (index===-1 || this.state.dataSource[index].level === row.level)
            return;
        Modal.confirm({
            title: '确认修改等级?',
            icon: <ExclamationCircleOutlined />,
            content: '确认将管理员['+row.count+']的等级修改为['+row.level+']?',
            okText:'确定',
            onOk:() =>{
                this.updateadminlevel([row.count], row.level);
            },
            cancelText:'取消',
        });
    };
    updatelevel = ()=>{
        this.setState({
            levelVisible:true
        });
    };
    levelOk = ()=>{
        this.updateadminlevel(this.state.selectedRowKeys, this.state.levelText);
    };
    levelCancel = ()=>{
        this.setState({
            levelVisible:false
        });
    };
    updateLevelText = (e)=>{
        this.setState({
            levelText:e.target.value
        });
    };
    //修改某些管理员的等级
    updateadminlevel = (counts, level)=>{
        api.updateadminlevel(JSON.stringify({count:counts.join(','), level}))
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    let dataSource = Array.from(this.state.dataSource, value=>{
                        let index = counts.findIndex(v=>v==value.count);
                        if (index === -1)
                            return value;
                        else
                            return {...value,level}
                    });
                    this.setState({
                        dataSource,
                        levelVisible:false
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
                selectedForbidKeys.push(item.count);
            else if (item.status === '可使用')
                selectedPublicKeys.push(item.count);
        });
        this.setState({
            selectedRowKeys:e,
            selectedForbidKeys,
            selectedPublicKeys
        });
    };
    //表的任何地方发生变化
    tableChange = (pagination, filters)=>{
        let config = {};
        //若是改变的页数，则以改变后的为准；若不是改变的页数，则表示过滤别的，需要将页数调整为1
        if (this.state.current === pagination.current)
            config.page = 1;
        else
            config.page = pagination.current;
        //看过滤的哪些有值，将有值的作为过滤条件
        for (let key in filters) {
            if (filters[key]) {
                config[key] = filters[key][0];
            }
        }
        this.serchData(config);
    };
    //搜索数据
    serchData = (config)=>{
        api.getadminusers(config)
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    let dataSource = Array.from(data.data,v=>{
                        v.key = v.count;
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

    //添加管理员
    addadmin = ()=>{
        Modal.info({
            title:"添加管理员",
            okText:'关闭',
            width:800,
            content:<Addadmin zchandleOk={this.zchandleOk}/>
        });
    };
    zchandleOk = (data)=>{
        if (!data.status)
            data.status = '可使用';
        if (!data.sex)
            data.sex = '男';
        if (!data.level)
            data.level = 2;
        data.key = data.count;
        this.setState({
            dataSource:[...this.state.dataSource, data]
        });
    };

    //初始化列名
    initColumns = ()=>{
        let columns = [
            {
                title: '账户',
                width: 100,
                dataIndex: 'count',
                key: 'count',
                fixed:'left',
                ...this.getColumnSearchProps('账户'),
            },
            {
                title: '昵称',
                width: 100,
                dataIndex: 'name',
                key: 'name',
                ...this.getColumnSearchProps('昵称'),
            },
            {
                title: '性别',
                width: 100,
                dataIndex: 'sex',
                key: 'sex',
                ...this.getColumnSearchProps('性别'),
            },
            {
                title: '等级',
                width: 100,
                dataIndex: 'level',
                key: 'level',
                editable: true,
                ...this.getColumnSearchProps('等级'),
            },
            {
                title: '状态',
                width: 100,
                dataIndex: 'status',
                key: 'status',
                ...this.getColumnSearchProps('状态'),
            },
            {
                title: '操作',
                key: 'action',
                width: 65,
                render: (text, record) => (
                    record.status==='可使用'?
                        <Popconfirm
                            title="确认禁止该管理员?"
                            onConfirm={() => this.forbid(record.key)}
                            cancelText='取消'
                            okText='确定'
                        >
                            <Button
                                size='small'
                                type='danger'
                            >禁止</Button>
                        </Popconfirm>
                        :
                        <Popconfirm
                            title="确认解禁该管理员?"
                            onConfirm={() => this.reforbid(record.key)}
                            cancelText='取消'
                            okText='确定'
                        >
                            <Button
                                size='small'
                                type='primary'
                            >解禁</Button>
                        </Popconfirm>
                ),
                fixed:'right'
            },
        ];
        return columns;
    };
    render() {
        const components = {
            body: {
                row: EditableRow,
                cell: EditableCell,
            },
        };
        const columns = this.state.columns.map(col => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    editable: col.editable,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    handleSave: this.handleSave,
                }),
            };
        });
        return (
            this.admin && this.admin.level === 1?
                <div>
                    <div className='btn-box'>
                        <Button
                            size='small'
                            type="primary"
                            onClick={this.addadmin}
                        >
                            添加管理员
                        </Button>
                        <div>
                            <Button
                                onClick={this.updatelevel}
                                size='small'
                                type="primary"
                                disabled={this.state.selectedRowKeys.length===0}
                            >
                                修改等级
                            </Button>
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
                            components={components}
                            rowClassName={() => 'editable-row'}
                            columns={columns}
                            dataSource={this.state.dataSource}
                            scroll={{ x: 565 }}
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
                    <Modal
                        title="修改等级"
                        visible={this.state.levelVisible}
                        onOk={this.levelOk}
                        onCancel={this.levelCancel}
                        okText='确定'
                        cancelText='取消'
                    >
                        <p>确认将选择的所有管理员的等级修改为所输入的？</p>
                        <Input
                            type='number'
                            value={this.state.levelText}
                            onChange={this.updateLevelText}
                        />
                    </Modal>
                </div>
                :
                <div>您的权限不够！</div>
        );
    }
}