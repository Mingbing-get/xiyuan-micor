import React from 'react';

import { withRouter } from 'react-router-dom';

import { Layout, Menu, Badge } from 'antd';
const { Sider } = Layout;

class Aside extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            selectedKeys:'/publish'
        };
    };
    componentDidMount(){
        let pathName = this.props.history.location.pathname;
        if (pathName.indexOf('/persondata') !== -1 || pathName.indexOf('/updatepassword') !== -1){
            this.setState({
                selectedKeys:''
            });
        }
        else{
            pathName = pathName.split('/');
            pathName = '/'+pathName[pathName.length-1];
            if (pathName !== '/publish'){
                this.setState({
                    selectedKeys:pathName
                });
            }
        }
    }
    componentWillUpdate(){
        let pathName = this.props.history.location.pathname;
        if (pathName.indexOf('/persondata') !== -1 || pathName.indexOf('/updatepassword') !== -1){
            if (this.state.selectedKeys !== ''){
                this.setState({
                    selectedKeys:''
                });
            }
        }
        else if (pathName.startsWith('/mine/')){
            pathName = pathName.substring(6);
            let index = pathName.indexOf('/');
            let selectedKeys = index === -1?'/'+pathName: '/'+pathName.substring(0,index);
            if (this.state.selectedKeys !== selectedKeys){
                this.setState({
                    selectedKeys:selectedKeys
                });
            }
        }
    }
    menuClick = (e)=>{
        this.setState({
            selectedKeys:e.key
        });
        if (this.props.history.location.pathname !== '/mine'+e.key)
            this.props.history.push('/mine'+e.key);
    };
    render(){
        return(
            <Sider className="site-layout-background" width={150}>
                <Menu
                    mode="inline"
                    selectedKeys={[this.state.selectedKeys]}
                    onClick={(e)=>{this.menuClick(e)}}
                    style={{ height: '100%' }}
                >
                    <Menu.Item key='/publish'>发表</Menu.Item>
                    <Menu.Item key='/newpage'>新苑</Menu.Item>
                    <Menu.Item key='/draft'>草稿</Menu.Item>
                    <Menu.Item key='/message'>
                        <Badge count={this.props.noread<=0?0:this.props.noread} offset={[40, 8]}>消息 </Badge>
                    </Menu.Item>
                    <Menu.Item key='/feedback'>反馈</Menu.Item>
                </Menu>
            </Sider>
        )
    }
}

export default withRouter(Aside);