import React from 'react';
import './index.css';

import {Button, Modal, Tooltip, Table, Input, Space, message, Upload} from 'antd';
import { QuestionCircleOutlined, SearchOutlined, ExclamationCircleOutlined, UploadOutlined } from '@ant-design/icons'
import Addmicor from './addMicor';
import {EditableRow, EditableCell} from '../../components/editable';

import api from '../../http/api.js';

export default class Micorapp extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            isModalVisible: false,
            columns:[],
            dataSource:null,
            current:1,
            total:0,
            fileList:[]
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
        api.getmicor(config)
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    let dataSource = Array.from(data.data,v=>{
                        v.key = v.id;
                        v.time = (new Date(v.time)).format('yyyy-MM-dd hh:mm:ss');
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
    handleSave = (row)=>{
        let index = this.state.dataSource.findIndex(v=>v.id===row.id);
        if (index===-1 || this.state.dataSource[index].looker === row.looker)
            return;
        Modal.confirm({
            title: '确认修改可见性?',
            icon: <ExclamationCircleOutlined />,
            content: '确认将组件['+row.micorname+']的可见性为['+row.looker+']?',
            okText:'确定',
            onOk:() =>{
                this.updatelooker([row.id], row.looker);
            },
            cancelText:'取消',
        });
    };
    //修改某些管理员的等级
    updatelooker = (ids, looker)=>{
        api.updatelooker(JSON.stringify({id:ids.join(','), looker}))
            .then(res=>res.json())
            .then(data=>{
                if (data.status === 1){
                    let dataSource = Array.from(this.state.dataSource, value=>{
                        let index = ids.findIndex(v=>v==value.id);
                        if (index === -1)
                            return value;
                        else
                            return {...value,looker:looker==='any'?"":looker}
                    });
                    this.setState({
                        dataSource
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

    // 更新微应用
    updateMicorApp = (item) => {
        Modal.info({
            title: '更新微应用',
            content: (<div>
                <h4>更新： {item.micorname}</h4>
                <p>随机key： {item.micorkey}</p>
                <Upload
                    name="micor"
                    action="/admin/micorapp"
                    fileList={this.state.fileList}
                    beforeUpload={(e)=>this.beforeUpload(e, item.micorkey)}
                    onChange={this.onChange}
                    onRemove={this.onRemove}
                    accept='.zip'
                >
                    <Button icon={<UploadOutlined />}>上传微应用</Button> (支持.zip格式)
                </Upload>
            </div>),
            okText:'关闭',
            onOk: ()=>{
                this.setState({
                    fileList: []
                })
            }
        });
    };
    beforeUpload = (e, key)=>{
        if (e.name.indexOf(key) === -1){
            message.warning('文件名必须与随机key一致!');
            return false;
        }
        return new Promise((resolve, reject)=>{
            Modal.confirm({
                title: '确认更新？',
                content: '确定更新该微应用？',
                okText:'确定',
                cancelText:'取消',
                onOk: ()=>{
                    resolve();
                    this.setState({
                        fileList: [e]
                    })
                },
                onCancel: ()=>{
                    reject()
                }
            });
        });
    };
    onRemove = (e)=>{
        this.setState({
            fileList: []
        })
    };
    onChange({ file }) {
        if (file.status === 'done'){
            message.success('更新成功!');
        }
        else if (file.status === 'error'){
            message.error('更新失败!');
        }
    };

    //初始化列名
    initColumns = ()=>{
        let columns = [
            {
                title: 'ID',
                width: 60,
                dataIndex: 'id',
                key: 'id',
                fixed: 'left',
            },
            {
                title: '随机key',
                width: 100,
                dataIndex: 'micorkey',
                key: 'micorkey',
                ...this.getColumnSearchProps('随机key'),
            },
            {
                title: '组件名称',
                width: 100,
                dataIndex: 'micorname',
                key: 'micorname',
                ellipsis: {
                    showTitle: false,
                },
                render: title => (
                    <Tooltip placement="topLeft" title={title}>
                        {title}
                    </Tooltip>
                ),
                ...this.getColumnSearchProps('组件名称'),
            },
            {
                title: '组件描述',
                width: 100,
                dataIndex: 'micordis',
                key: 'micordis',
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
                title: '上传者',
                width: 100,
                dataIndex: 'uploader',
                key: 'uploader',
                ...this.getColumnSearchProps('上传者'),
            },
            {
                title: '可见性',
                width: 100,
                dataIndex: 'looker',
                key: 'looker',
                editable: true,
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
                title: '操作',
                key: 'action',
                width: 65,
                render: (text, record) => (
                    <Button
                        size='small'
                        type='primary'
                        onClick={()=>{this.updateMicorApp(record)}}
                    >更新</Button>
                ),
                fixed:'right'
            },
        ];
        return columns;
    };
    showAddMicor = ()=>{
        this.setState({
            isModalVisible: true
        })
    };
    handleOk = ()=>{
        this.setState({
            isModalVisible: false
        })
    };
    handleCancel = ()=>{
        this.setState({
            isModalVisible: false
        })
    };
    showRule = ()=>{
        Modal.info({
            title: '如何创建一个微应用',
            content: (
                <ol style={{paddingLeft:0}}>
                    <li>去git上获取模板
                        <a href='https://github.com/Mingbing-get/xiyuan-micor-react' target='_blank'>react模板</a>
                    </li>
                    <li>按照模板中的README.md文件步骤完成</li>
                    <li>随机key点击 添加微应用 后会自动给出(每次点击会变化)</li>
                    <li>将打包后的微应用上传，并提交对应的信息</li>
                </ol>
            ),
            okText:'知道了'
        })
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
            <div>
                <Button onClick={this.showAddMicor} type="primary" style={{marginRight: '10px'}}>添加微应用</Button>
                <Tooltip title="如何创建微应用?">
                    <QuestionCircleOutlined style={{cursor: 'pointer'}} onClick={this.showRule}/>
                </Tooltip>
                {
                    this.state.dataSource &&
                    <Table
                        columns={columns}
                        rowClassName={() => 'editable-row'}
                        components={components}
                        dataSource={this.state.dataSource}
                        scroll={{ x: 1295 }}
                        size='small'
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
                    title="添加微应用"
                    visible={this.state.isModalVisible}
                    wrapClassName="add-micor-modal"
                    onCancel={this.handleCancel}
                >
                    <Addmicor handleOk={this.handleOk}/>
                </Modal>
            </div>
        );
    }
}