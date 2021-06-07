//导入第三方模块
const express = require("express");
const body_parser = require("body-parser");
const cookParser = require("cookie-parser");
const session = require("express-session");

//导入自己写的模块
require('./base.js');
const router = require("./routers.js");
const adminrouter = require("./adminrouters.js");

const app = express();
//设置跨域访问
app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", req.headers.origin); // 设置允许来自哪里的跨域请求访问（req.headers.origin为当前访问来源的域名与端口）
    res.header("Cache-Control","no-cache");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS"); // 设置允许接收的请求类型
    res.header("Access-Control-Allow-Headers", "Origin, withCredentials, X-Requested-With," +
        " Content-Type,Token,Accept, Connection, User-Agent, Cookie, null"); // 设置请求头中允许携带的参数
    res.header("Access-Control-Allow-Credentials", 'true'); // 允许客户端携带证书式访问。保持跨域请求中的Cookie。注意：此处设true时，Access-Control-Allow-Origin的值不能为 '*'
    res.header("Access-control-max-age", 1000); // 设置请求通过预检后多少时间内不再检验，减少预请求发送次数
    next();
});

//开放文件夹
app.use('/public', express.static('public'));

//使用模块
app.use(body_parser.json());
app.use(body_parser.urlencoded({extended:false}));
app.use(cookParser());
app.use(session({
    //参数配置
    secret:'lucksession',//加密字符串
    name:'user',//返回客户端key的名称，默认为connect_sid
    resave:false,//强制保存session，即使它没有变化
    saveUninitialized:true,//强制将未初始化的session存储。当新建一个session且未设定属性或值时，它就处于未初始化状态。在设定cookie前，这对于登录验证，减轻服务器存储压力，权限控制是有帮助的，默认为true
}));
app.use(router);
app.use(adminrouter);

module.exports = app;