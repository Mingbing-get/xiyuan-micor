//导入配置选项
pz = require("./myconfig.js");

//导入第三方模块
const http = require('http');
const socket_io = require('socket.io');

//导入自己写的模块
const app = require("./app.js");
const db = require("./db.js");
const server = http.createServer(app);

const io = socket_io.listen(server);

//用于保存所有的用户账户和对应的socket
var sockets = {};
//即时通信
io.on('connect', (socket)=>{
    //用户登录的时候，将该用户的zhanghu和它对应的socket存起来
    socket.on('user', (data)=>{
        //判断给用户是否已经登录，若登录，则告诉原来的用户账户在别处登录了
        if (sockets[data]){
            sockets[data].emit('online');
        }
        sockets[data] = socket;
    });
    //用户退出登录的时候，将该用户的账户和对应的socket删除
    socket.on('logout', (data)=>{
        delete sockets[data];
    });
    //该用户给别的用户发消息的时候触发
    socket.on('message', (data)=>{
        //将消息存到数据库中
        db.updatedb(db.creatInsertSql('message', data))
            .then(result=>{
                if (result.affectedRows === 1){
                    data.id = result.insertId;
                    if (sockets[data.resever])
                        sockets[data.resever].emit('message', data);
                }
            })
            .catch(error=>{});
    });
});

//监听窗口
server.listen(pz.port, pz.dizi, ()=>{
   console.log("runing...");
});