//导入第三方模块
const express = require("express");
const bcrypt = require("bcryptjs");
const formidable = require("formidable");
const { resolve } = require('path');

//导入自己的模块
const db = require("./db.js");
const readFile = require("./readfile.js");

const router = express.Router();

//设置开放文件夹的路径
const dir = __dirname;
//给出加密种子
const salt = '$2a$10$avJpn7JMVNCBm7mHxHiMlu';

router.all('/public/*', function (req, res) {
    readFile.readfile(dir+req.url)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.send('找不到数据!');
        });
});

router.get('/', function (req, res) {
    let deviceAgent = req.headers["user-agent"].toLowerCase();
    let agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/);
    if(agentID){
        readFile.readfile(dir+'/public/phone/index.html')
            .then(function (data) {
                res.send(data);
            })
            .catch(function (err) {
                res.send('找不到页面!');
            });
    }else{
        readFile.readfile(dir+'/public/build/index.html')
            .then(function (data) {
                res.send(data);
            })
            .catch(function (err) {
                res.send('找不到页面!');
            });
    }
});

//登录
router.post('/api/login', function (req, res) {
    let resm = {status:0, message:'error'};
    let password = bcrypt.hashSync(req.body.password,salt);
    db.querydb('select count,name,tel,email,sex,birthday,touxiang from user where count = '+req.body.count+' and password = "'+password+'" limit 1')
        .then((data)=>{
            if (data.length === 1){
                req.session.user = data[0];
                resm.user = data[0];
                resm.status = 1;
                resm.message = 'success';
            }
            res.send(resm);
        })
        .catch((error)=>{
            res.send(resm);
        })
});

//检查是否登录
router.get('/api/islogin', function (req, res) {
    let resm = {status:0, message:'未登录'};
    if (req.session.user){
        resm.status = 1;
        resm.message = '已登录';
        resm.user = req.session.user;
    }
    res.send(resm);
});

//退出登录
router.get('/api/logout', function (req, res) {
    let resm = {status:1, message:'退出成功!'};
    req.session.user = null;
    res.send(resm);
});

//检查某个账户是否已经注册
router.get('/api/isregist', function (req, res) {
   let resm = {status:0, message:'该账户已经被注册!'};
   db.querydb('select count(count) as count from user where count = '+req.query.count)
       .then(data=>{
           if (data[0].count === 0){
               resm.status = 1;
               resm.message = '允许注册该账户!';
           }
           res.send(resm);
       })
       .catch(error=>{
           res.send(resm);
       });
});

//注册
router.post('/api/regist', function (req, res) {
   let resm = {status:0, message:'输入信息不符合规则!'};
   let xinxi = req.body;
   //数据验证
    if ( !xinxi.count || xinxi.count.length<5 || xinxi.count.length>11
        || !xinxi.name || xinxi.name.length>7
        || !xinxi.password || xinxi.password.length<6 || xinxi.password.length>20
        || !['男','女'].includes(xinxi.sex)
        || !xinxi.tel || xinxi.tel.length>11 ){
        res.send(resm);
        return;
    }
    xinxi.password = bcrypt.hashSync(xinxi.password,salt);//对密码加密
    db.updatedb(db.creatInsertSql('user', xinxi))
        .then(data=>{
            if (data.affectedRows === 1){
                resm.status = 1;
                resm.message = '注册成功!';
                //添加一条欢迎信息
                return db.updatedb('insert into message (sender,resever,content,time,isread) VALUES (111111,'+
                    xinxi.count+',"【欢迎使用】 欢迎 '+xinxi.name+' 来到嘻苑！该网站可以使您轻松的写出各种样式的文章！点击（新苑）发表一篇自己的文章吧！","'+
                new Date().format('yyyy-MM-dd hh:mm:ss')+'","未读")')
            }
            else
                throw new Error('注册失败!');
        })
        .then(data=>{
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//处理头像
router.post('/api/touxiang',function (req, res) {
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = "./public/touxiang";
    form.keepExtensions = true;//保留后缀
    form.maxFieldsSize = 20 * 1024 * 1024;
    //处理图片
    form.parse(req, function (err, fields, files) {
        var resm = {status:1,message:'上传图片成功!',path:''};
        if (err){
            resm.status = 0;
            resm.message = '上传图片失败!';
            return res.send(JSON.stringify(resm));
        }
        resm.path = files.touxiang.path;
        res.send(JSON.stringify(resm));
    });
});

//用户修改信息
router.post('/api/updateuser', function (req, res) {
    let resm = {status:0, message:'输入信息不符合规则!'};
    let xinxi = req.body;
    //数据验证
    if (!xinxi.count
        || (xinxi.name && xinxi.name.length>7)
        || (xinxi.sex && !['男','女'].includes(xinxi.sex))
        || (xinxi.tel && xinxi.tel.length>11)){
        res.send(resm);
        return;
    }
    db.updatedb(db.creatUpdateSql('user',xinxi,['count'])+' limit 1')
        .then(data=>{
            if (data.affectedRows === 1){
                resm.status = 1;
                resm.message = '修改信息成功!';
                //修改保存在session中的数据
                for (let key in xinxi){
                    req.session.user[key] = xinxi[key];
                }
            }
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//用户修改密码
router.post('/api/updatepassword', function (req, res) {
    let resm = {status:0, message:'输入信息不符合规则!'};
    if (req.body.password !== req.body.confirmPassword || req.body.password === req.body.oldPassword){
        res.send(resm);
        return;
    }
    db.updatedb('update user set password = "'+bcrypt.hashSync(req.body.password,salt)+
        '" where count="'+req.body.count+'" and password="'+bcrypt.hashSync(req.body.oldPassword,salt)+'" limit 1')
        .then(data=>{
            if (data.affectedRows === 1){
                resm.status = 1;
                resm.message = '修改成功!';
            }
            else {
                resm.message = '密码错误!';
            }
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//用于检查某个访问地址是否已经存在
router.get('/api/availableurl', function (req, res) {
    let resm = {status:0, message:'输入信息不符合规则!'};
    let xinxi = req.query;
    if (!xinxi.count || !xinxi.url || !/^[a-zA-Z0-9]{4,23}$/.test(xinxi.url)){
        res.send(resm);
        return;
    }
    db.querydb('select count(id) as count from page where usercount='+xinxi.count+' and url="'+xinxi.url+'"')
        .then(data=>{
            if (data[0].count === 0){
                resm.status = 1;
                resm.message = '该地址可用!';
            }
            else {
                resm.message = '该地址已经被使用过了!';
            }
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//用于查询显示哪些组件
router.get('/api/showcomponent', function (req, res) {
    let resm = {status:0, message:'获取组件信息失败!'};
    if (req.query.micorkey){
        //表示获取某个组件的信息
        db.querydb('select * from microapp where micorkey = "'+req.query.micorkey+'" limit 1')
            .then(data=>{
                resm.data = data;
                resm.status = 1;
                resm.message = '获取成功!';
                res.send(resm);
            })
            .catch(error=>{
                res.send(resm);
            });
        return;
    }
    // 获取到某个用户的所有组件及其组件的分组信息
    if (!req.query.count){
        res.send(resm);
        return;
    }
    Promise.all([db.querydb('select * from microapp where looker = "base"'),
        db.querydb('SELECT micorgroup.groupname, microapp.* from micorgroup LEFT JOIN' +
            ' microapp on micorgroup.micorid=microapp.id where usercount="'+req.query.count+'"')])
        .then(data=>{
            const resData = {'基础样式': data[0]};
            data[1].forEach(value=>{
                if (!resData[value.groupname]){
                    resData[value.groupname] = [value];
                }
                else {
                    resData[value.groupname].push(value);
                }
            });
            resm.data = resData;
            resm.status = 1;
            resm.message = '获取成功!';
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        })
});

//用于搜索组件
router.get('/api/serchmicor', function (req, res) {
    let resm = {status:0, message:'搜索失败!'};
    if (!req.query.serchText || !req.query.count){
        res.send(resm);
        return;
    }
    const st = req.query.serchText;
    db.querydb('select * from microapp WHERE looker != "base" and ' +
        '(micorkey like "%'+st+'%" or micorname like "%'+st+'%" or micordis like "%'+st+'%")')
        .then(data=>{
            resm.status = 1;
            resm.message = '查询成功!';
            resm.data = data.filter(value=>{
                if (!value.looker || value.looker.split(',').includes(req.query.count))
                    return true;
                return false;
            });
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//用于添加组件到自己的显示栏中
router.post('/api/addmicorgroup', function (req, res) {
    let resm = {status:0, message:'参数错误!'};
    let xinxi = req.body;
    if (!xinxi.usercount || !xinxi.groupname || !xinxi.micorid
        || !(xinxi.micorid instanceof Array) || xinxi.micorid.length === 0){
        res.send(resm);
        return;
    }
    xinxi.time = new Date().format('yyyy-MM-dd hh:mm:ss');
    const values = xinxi.micorid.map(item=>[xinxi.usercount, xinxi.groupname, item, xinxi.time]);
    db.insertAll('INSERT INTO micorgroup(`usercount`,`groupname`,`micorid`, `time`) VALUES ?', values)
        .then(data=>{
            if (data.affectedRows > 0){
                resm.status = 1;
                resm.message = '添加成功!';
            }
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//用于删除某个分组
router.post('/api/deletemicorgroup', function (req, res) {
    let resm = {status:0, message:'参数错误!'};
    let xinxi = req.body;
    if (!xinxi.usercount || !xinxi.groupname || !xinxi.action){
        res.send(resm);
        return;
    }
    if (xinxi.action === '直接删除'){
        db.updatedb('delete from micorgroup where usercount="'+xinxi.usercount+
            '" and groupname="'+xinxi.groupname+'"')
            .then(data=>{
                if (data.affectedRows > 0){
                    resm.status = 1;
                    resm.message = '删除成功';
                }
                res.send(resm);
            })
            .catch(error=>{
                res.send(resm);
            })
    }
    else {
        const moveto = xinxi.action.split(' ')[1];
        db.updatedb('update micorgroup set groupname="'+moveto+'" where usercount="'
            +xinxi.usercount+'" and groupname="'+xinxi.groupname+'"')
            .then(data=>{
                if (data.affectedRows > 0){
                    resm.status = 1;
                    resm.message = '移动成功';
                }
                res.send(resm);
            })
            .catch(error=>{
                res.send(resm);
            })
    }
});

//用于删除某个样式
router.post('/api/deletesiglemicor', function (req, res) {
    let resm = {status:0, message:'参数错误!'};
    let xinxi = req.body;
    if (!xinxi.usercount || !xinxi.groupname || !xinxi.action || !xinxi.micorid){
        res.send(resm);
        return;
    }
    if (xinxi.action === '直接删除'){
        db.updatedb('delete from micorgroup where usercount="'+xinxi.usercount+
            '" and groupname="'+xinxi.groupname+'" and micorid='+xinxi.micorid+' limit 1')
            .then(data=>{
                if (data.affectedRows > 0){
                    resm.status = 1;
                    resm.message = '删除成功';
                }
                res.send(resm);
            })
            .catch(error=>{
                res.send(resm);
            })
    }
    else {
        const moveto = xinxi.action.split(' ')[1];
        db.updatedb('update micorgroup set groupname="'+moveto+'" where usercount="'
            +xinxi.usercount+'" and groupname="'+xinxi.groupname+'" and micorid='+xinxi.micorid+' limit 1')
            .then(data=>{
                if (data.affectedRows > 0){
                    resm.status = 1;
                    resm.message = '移动成功';
                }
                res.send(resm);
            })
            .catch(error=>{
                res.send(resm);
            })
    }
});

//用户点击存稿
router.post('/api/savepage', function (req, res) {
    let xinxi = req.body;
    xinxi.status = '草稿';
    saveNewPage(xinxi, res);
});

//用户点击发表
router.post('/api/publish', function (req, res) {
    let xinxi = req.body;
    xinxi.status = '发表';
    saveNewPage(xinxi, res);
});

function saveNewPage(xinxi, res){
    let resm = {status:0, message:'保存失败!'};
    //当提供了页面的id时，表示已经保存过了，则使用更新语句来更新页面信息
    if (xinxi.id){
        db.updatedb(db.creatUpdateSql('page', xinxi, ['id'], ['componentData', 'pageid']))
            .then(data=>{
                return db.updatedb('delete from component where pageid = '+xinxi.id)
            })
            .then(data=>{
                let componentData = xinxi.componentData;
                let promiseArray = [];
                componentData.forEach((value,index)=>{
                    value.pageid = xinxi.id;
                    value.cporder = index;
                    promiseArray.push(db.updatedb(db.creatInsertSql('component', value)));
                });
                return Promise.all(promiseArray)
            })
            .then(value => {
                resm.status = 1;
                resm.data = {id:xinxi.id};
                resm.message = '保存成功!';
                res.send(resm);
            })
            .catch(error=>{
                res.send(resm);
            });
        return;
    }
    //当没有提供id时，表示是第一次保存，则需要先验证数据的正确性
    if (!xinxi.usercount || !xinxi.url || !/^[a-zA-Z0-9]{4,23}$/.test(xinxi.url)){
        res.send(resm);
        return;
    }
    //再去数据库中判断该地址是否已经被使用过了
    db.querydb('select count(id) as count from page where usercount='+xinxi.usercount+' and url="'+xinxi.url+'"')
        .then(data=>{
            if (data[0].count === 0){
                return db.updatedb(db.creatInsertSql('page', xinxi, ['componentData']))
            }
            throw new Error('该地址已经存在!');
        })
        .then(data=>{
            if (data.affectedRows === 0){
                throw new Error('保存失败!');
            }
            let pageid = data.insertId;
            resm.data = {id:pageid};
            let componentData = xinxi.componentData;
            let promiseArray = [];
            componentData.forEach((value,index)=>{
                value.pageid = pageid;
                value.cporder = index;
                promiseArray.push(db.updatedb(db.creatInsertSql('component', value)));
            });
            return Promise.all(promiseArray)
        })
        .then(value => {
            resm.status = 1;
            resm.message = '保存成功!';
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
}

//用于查询某个用户有哪些草稿
router.get('/api/querydraft', function (req, res) {
    let resm = {status:0, message:'查询失败!'};
    const count = req.query.count;
    if (!count){
        res.send(resm);
        return;
    }
    db.querydb('select * from page where usercount='+count+' and status="草稿" order by time desc')
        .then(data=>{
            resm.status = 1;
            resm.message='查询成功!';
            resm.data = data;
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//用于查询某个发表了哪些文章包括(标题，描述，时间，点赞数，评论数)
router.get('/api/queryuppage', function (req, res) {
    let resm = {status:0,message:'查询失败!'};
    const count = req.query.count;
    const pagenum = 6;
    const page = req.query.page;
    if (!count){
        res.send(resm);
        return;
    }
    db.querydb('select page.id,page.title,page.url,page.usercount,page.version,page.discription,page.time,' +
        'count(DISTINCT agument.id) as agumentCount,count(DISTINCT pagelike.id) as likeCount ' +
        'from page left join agument on agument.pageid=page.id LEFT JOIN pagelike on pagelike.pageid=page.id ' +
        'where page.usercount='+count+' and page.status="发表" GROUP BY page.id order by page.time desc limit '+(page-1)*pagenum+','+pagenum)
        .then(data=>{
            resm.data = data;
            resm.status = 1;
            resm.message = '查询成功!';
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//用于查询某个人发表了哪些评论包括(这些评论的文章信息)
router.get('/api/queryuagument', function (req, res) {
    let resm = {status:0,message:'查询失败!'};
    const count = req.query.count;
    const pagenum = 6;
    const page = req.query.page;
    if (!count){
        res.send(resm);
        return;
    }
    db.querydb('select agument.*, user.name, user.touxiang from agument left JOIN user on agument.usercount=user.count' +
        ' where agument.usercount='+count+' ORDER BY agument.time desc limit '+(page-1)*pagenum+','+pagenum)
        .then(data=>{
            resm.data = data;
            let pageids = Array.from(data,item=>item.pageid).join(',');
            if (data.length === 0){
                return new Promise(resolve => {
                    resolve(1);
                });
            }
            else {
                return db.querydb('select page.id,page.url,page.usercount,page.version,page.title,page.discription,page.time,user.name,' +
                    'count(DISTINCT agument.id) as agumentCount,count(DISTINCT pagelike.id) as likeCount ' +
                    'from page left join agument on agument.pageid=page.id LEFT JOIN pagelike on pagelike.pageid=page.id ' +
                    'LEFT JOIN user on user.count=page.usercount ' +
                    'where page.id in ('+pageids+') GROUP BY page.id');
            }
        })
        .then(data=>{
            if (data !== 1){
                resm.data.forEach(item=>{
                    let index = data.findIndex(indexv=>indexv.id===item.pageid);
                    if (index===-1)
                        throw new Error('查找对应id失败!');
                    item.pageInfo = data[index];
                });
            }
            resm.status = 1;
            resm.message = '查找成功!';
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//用于查询被关注的排行
router.get('/api/followtop', function (req, res) {
    let resm = {status:0, message:'查询失败!'};
    const page = req.query.page||1;
    const pagenum = 10;
    db.querydb('select byfollowuc, count(id) as followCount from follow GROUP BY byfollowuc ORDER BY followCount desc limit '+(page-1)*pagenum+','+pagenum)
        .then(data=>{
            let follows = Array.from(data,value=>value.byfollowuc).join(',');
            resm.data = data;
            if (data.length === 0){
                return new Promise(resolve => {
                    resolve(1);
                });
            }
            else {
                return Promise.all([db.querydb('select count,sex,name,touxiang from user where count in ('+follows+')'),
                    db.querydb('select usercount,count(id) as pageCount from page where usercount in ('+follows+') and status="发表" GROUP BY usercount'),
                    db.querydb('select usercount,count(id) as agumentCount from agument where usercount in ('+follows+') GROUP BY usercount'),
                    db.querydb('select page.usercount,count(pagelike.id) as likeCount from page,pagelike where page.usercount in ('+follows+')' +
                        ' and page.status="发表" and page.id=pagelike.pageid GROUP BY page.usercount')]);
            }
        })
        .then(values=>{
            if (values !== 1){
                resm.data.forEach(item=>{
                    let index = values[0].findIndex(vi=>vi.count===item.byfollowuc);
                    item.userInfo = values[0][index];

                    index = values[1].findIndex(vi=>vi.usercount===item.byfollowuc);
                    if (index === -1)
                        item.pageCount = 0;
                    else
                        item.pageCount = values[1][index].pageCount;

                    index = values[2].findIndex(vi=>vi.usercount===item.byfollowuc);
                    if (index === -1)
                        item.agumentCount = 0;
                    else
                        item.agumentCount = values[2][index].agumentCount;

                    index = values[3].findIndex(vi=>vi.usercount===item.byfollowuc);
                    if (index === -1)
                        item.likeCount = 0;
                    else
                        item.likeCount = values[3][index].likeCount;
                });
            }
            resm.status = 1;
            resm.message = '查询成功!';
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//用于查询某人被哪些人关注了包括(这些人的发表文章数，被关注数，评论数，收获的喜欢数)
router.get('/api/queryubyfollow', function (req, res) {
    let resm = {status:0,message:'查询失败!'};
    const count = req.query.count;
    const pagenum = 10;
    const page = req.query.page;
    if (!count){
        res.send(resm);
        return;
    }
    db.querydb('select * from follow where byfollowuc='+count+' ORDER BY time DESC limit '+(page-1)*pagenum+','+pagenum)
        .then(data=>{
            let follows = Array.from(data,value=>value.followuc).join(',');
            resm.data = data;
            if (data.length === 0){
                return new Promise(resolve => {
                    resolve(1);
                });
            }
            else {
                return Promise.all([db.querydb('select count,sex,name,touxiang from user where count in ('+follows+')'),
                    db.querydb('select usercount,count(id) as pageCount from page where usercount in ('+follows+') and status="发表" GROUP BY usercount'),
                    db.querydb('select byfollowuc,count(followuc) as followCount from follow where byfollowuc in ('+follows+') GROUP BY byfollowuc'),
                    db.querydb('select usercount,count(id) as agumentCount from agument where usercount in ('+follows+') GROUP BY usercount'),
                    db.querydb('select page.usercount,count(pagelike.id) as likeCount from page,pagelike where page.usercount in ('+follows+')' +
                        ' and page.status="发表" and page.id=pagelike.pageid GROUP BY page.usercount')]);
            }
        })
        .then(values=>{
            if (values !== 1){
                resm.data.forEach(item=>{
                    let index = values[0].findIndex(vi=>vi.count===item.followuc);
                    item.userInfo = values[0][index];

                    index = values[1].findIndex(vi=>vi.usercount===item.followuc);
                    if (index === -1)
                        item.pageCount = 0;
                    else
                        item.pageCount = values[1][index].pageCount;

                    index = values[2].findIndex(vi=>vi.byfollowuc===item.followuc);
                    if (index === -1)
                        item.followCount = 0;
                    else
                        item.followCount = values[2][index].followCount;

                    index = values[3].findIndex(vi=>vi.usercount===item.followuc);
                    if (index === -1)
                        item.agumentCount = 0;
                    else
                        item.agumentCount = values[3][index].agumentCount;

                    index = values[4].findIndex(vi=>vi.usercount===item.followuc);
                    if (index === -1)
                        item.likeCount = 0;
                    else
                        item.likeCount = values[4][index].likeCount;
                });
            }
            resm.status = 1;
            resm.message = '查询成功!';
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//用于删除某一篇文章(包括草稿，发表等)
router.get('/api/deletepage', function (req, res) {
    let resm = {status:0, message:'删除失败!'};
    const id = req.query.id;
    if (!id){
        res.send(resm);
        return;
    }
    db.updatedb('delete from page where id='+id+' limit 1')
        .then(data=>{
            if (data.affectedRows === 1){
                resm.status = 1;
                resm.message = '删除成功!';
            }
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//用于查询整个页面(根据页面的id，包括页面的组件)
router.get('/api/querypage', function (req, res) {
    let resm = {status:0,message:'查询失败!'};
    const id = req.query.id;
    if (!id){
        res.send(resm);
        return;
    }
    Promise.all([db.querydb('select * from page where id = '+id+' limit 1'),
        db.querydb('select * from component where pageid = '+id+' group by cporder')])
        .then(value=>{
            let data = value[0][0];
            //去掉值为null的键值对，以防传送到前端时null变成字符串'null'
            for (let key in data){
                if (data[key] === null)
                    delete data[key];
            }
            value[1].forEach(dv=>{
                for (let key in dv){
                    if (dv[key] === null)
                        delete dv[key];
                }
            });
            data.componentData = value[1];
            resm.status = 1;
            resm.message = '查询成功!';
            resm.data = data;
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//用于查询整个页面(根据页面的id，包括页面的组件, 作者信息)
router.get('/api/querypageandwriter', function (req, res) {
    let resm = {status:0,message:'查询失败!'};
    const id = req.query.id;
    if (!id){
        res.send(resm);
        return;
    }
    db.querydb('select * from page where id = '+id+' limit 1')
        .then(data=>{
            if (data[0].status === '禁止'){
                resm.data = '该文章已被禁止，无法查看！';
                resm.status = 1;
                resm.message = '查询成功!';
                throw new Error('该文章已被禁止');
            }
            if (data[0].lookuser === 'online' && !req.query.count){
                resm.data = '该文章需要登录才能看，请先登录！';
                resm.status = 1;
                resm.message = '查询成功!';
                throw new Error('登录才能看');
            }
            if (data[0].lookuser === 'onlyme' && req.query.count !== data[0].usercount){
                resm.data = '您没有权限看这篇文章！';
                resm.status = 1;
                resm.message = '查询成功!';
                throw new Error('无权限查看文章');
            }
            //去掉值为null的键值对，以防传送到前端时null变成字符串'null'
            for (let key in data[0]){
                if (data[0][key] === null)
                    delete data[0][key];
            }
            resm.data = data[0];
            return Promise.all([
                db.querydb('select * from component where pageid = '+id+' group by cporder'),
                db.querydb('select usercount from pagelike where pageid = '+id),
                db.querydb('select agument.*,user.name,user.touxiang from agument,user where pageid='+id+' and user.count=agument.usercount ORDER BY agument.time DESC limit 6')])
        })
        .then(value=>{
            //去掉值为null的键值对，以防传送到前端时null变成字符串'null'
            value[0].forEach(dv=>{
                for (let key in dv){
                    if (dv[key] === null)
                        delete dv[key];
                }
            });
            resm.data.componentData = value[0];
            resm.data.likes = [];
            value[1].forEach(value=>{
                resm.data.likes.push(value.usercount);
            });
            resm.aguments = value[2];
            //为查询评论的评论准备数据
            let parentids = '(';
            value[2].forEach(value=>{
                parentids += (value.id+',');
            });
            parentids = parentids.substring(0,parentids.length-1)+')';
            let promiseArray = [db.querydb('select count,name,touxiang from user where count='+resm.data.usercount+' limit 1'),
                db.querydb('select version from page where usercount='+resm.data.usercount+' and url="'+resm.data.url+'" and status="发表"'),
                db.querydb('select followuc from follow where byfollowuc='+resm.data.usercount)];
            if (value[2].length > 0)//若有评论则去查询评论的子评论
                promiseArray.push(db.querydb('select childagu.*,user.name,user.touxiang from childagu,user where parentid in '+parentids+' and user.count=childagu.usercount ORDER BY time ASC'));
            return Promise.all(promiseArray)
        })
        .then(data=>{
            if (data[0].length === 0 || data[1].length === 0){
                throw new Error('查询失败');
            }
            resm.writer = data[0][0];
            resm.versions = [];
            data[1].forEach(value=>{
                resm.versions.push(value.version);
            });
            resm.writer.follows = [];
            data[2].forEach(value=>{
                resm.writer.follows.push(value.followuc);
            });
            //若有查询子评论，则将子评论添加到对应的评论下
            data[3] && data[3].forEach(value=>{
                let index = resm.aguments.findIndex(aguvalue => {
                    return aguvalue.id === value.parentid;
                });
                if (!resm.aguments[index].childagus)
                    resm.aguments[index].childagus = [];
                resm.aguments[index].childagus.push(value);
            });
            resm.status = 1;
            resm.message = '查询成功!';
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//用于查询整个页面(根据页面的usercount，url，version，包括页面的组件, 作者信息)
router.get('/api/querypagebyversion', function (req, res) {
    let resm = {status:0,message:'查询失败!'};
    const usercount = req.query.usercount;
    const url = req.query.url;
    const version = req.query.version;
    if (!usercount || !url){
        res.send(resm);
        return;
    }
    let sql = '';
    if (!version){
        sql = 'select * from page where usercount = '+usercount+ ' and url="'+url+'" order by version desc limit 1';
    }
    else {
        sql = 'select * from page where usercount = '+usercount+ ' and url="'+url+'" and version='+version+' limit 1';
    }
    db.querydb(sql)
        .then(data=>{
            if (data[0].length === 0){
                throw new Error('查询失败!');
            }
            if (data[0].status === '禁止'){
                resm.data = '该文章已被禁止，无法查看！';
                resm.status = 1;
                resm.message = '查询成功!';
                throw new Error('该文章已被禁止');
            }
            if (data[0].lookuser === 'online' && !req.query.count){
                resm.data = '该文章需要登录才能看，请先登录！';
                resm.status = 1;
                resm.message = '查询成功!';
                throw new Error('登录才能看');
            }
            if (data[0].lookuser === 'onlyme' && req.query.count !== data[0].usercount){
                resm.data = '您没有权限看这篇文章！';
                resm.status = 1;
                resm.message = '查询成功!';
                throw new Error('无权限查看文章');
            }
            //去掉值为null的键值对，以防传送到前端时null变成字符串'null'
            for (let key in data[0]){
                if (data[0][key] === null)
                    delete data[0][key];
            }
            resm.data = data[0];
            return Promise.all([
                db.querydb('select count,name,touxiang from user where count='+usercount+' limit 1'),
                db.querydb('select version from page where usercount='+usercount+' and url="'+url+'" and status="发表"'),
                db.querydb('select followuc from follow where byfollowuc='+usercount)])
        })
        .then(value => {
            if (value[0].length === 0 || value[1].length === 0){
                throw new Error('查询失败!');
            }
            resm.writer = value[0][0];
            resm.writer.follows = [];
            value[2].forEach(value=>{
                resm.writer.follows.push(value.followuc);
            });
            resm.versions = [];
            value[1].forEach(value=>{
                resm.versions.push(value.version);
            });
            return Promise.all([db.querydb('select * from component where pageid = '+resm.data.id+' group by cporder'),
                db.querydb('select usercount from pagelike where pageid = '+resm.data.id),
                db.querydb('select agument.*,user.name,user.touxiang from agument,user where pageid='+resm.data.id+' and user.count=agument.usercount ORDER BY agument.time DESC limit 6')])
        })
        .then(value => {
            value[0].forEach(dv=>{
                for (let key in dv){
                    if (dv[key] === null)
                        delete dv[key];
                }
            });
            resm.data.componentData = value[0];
            resm.data.likes = [];
            value[1].forEach(value=>{
                resm.data.likes.push(value.usercount);
            });
            resm.aguments = value[2];
            //为查询评论的评论准备数据
            let parentids = '(';
            value[2].forEach(value=>{
                parentids += (value.id+',');
            });
            parentids = parentids.substring(0,parentids.length-1)+')';
            //若该页面有评论，则进行子评论的查询，否则不查询
            if (value[2].length > 0)
                return db.querydb('select childagu.*,user.name,user.touxiang from childagu,user where parentid in '+parentids+' and user.count=childagu.usercount ORDER BY time ASC')
            else{
                return new Promise(resolve => {
                    resolve(1);
                })
            }
        })
        .then(data=>{
            if (data !== 1){//若有进行子评论的查询，则将查询结果添加到对应的评论中
                data.forEach(value=>{
                    let index = resm.aguments.findIndex(aguvalue => {
                        return aguvalue.id === value.parentid;
                    });
                    if (!resm.aguments[index].childagus)
                        resm.aguments[index].childagus = [];
                    resm.aguments[index].childagus.push(value);
                });
            }
            resm.status = 1;
            resm.message = '查询成功!';
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//用于查询首页的数据(每个文章的分类前五篇)
router.get('/api/categorytopfive', function (req, res) {
    let resm = {status:0, message:'查询失败!'};
    db.querydb('select a.*,t.likeCount from page a LEFT JOIN (select page.id, count(pagelike.id) as likeCount ' +
        'from page,pagelike where pageid=page.id GROUP BY page.id) t on a.id = t.id where a.status="发表" and ' +
        '5 > (select count(page.id) from page LEFT JOIN (select page.id, count(pagelike.id) as likeCount ' +
        'from page,pagelike where pageid=page.id GROUP BY page.id) ts on page.id = ts.id where page.category = a.category' +
        ' and page.status="发表" and ts.likeCount > t.likeCount) order by a.category,t.likeCount desc')
        .then(data=>{
            let ids = Array.from(data, v => v.id).join(',');
            let counts = Array.from(data, v => v.usercount).join(',');
            resm.data = data;
            if (data.length === 0){
                return new Promise(resolve => {
                    resolve(1);
                });
            }
            return Promise.all([db.querydb('select pageid, count(id) as agumentCount from agument where pageid in ('+ids+') group by pageid'),
                db.querydb('select count, name from user where count in ('+counts+')')]);
        })
        .then(values=>{
            if (values !== 1){
                let index = -1;
                resm.data.forEach(item=>{
                    index = values[0].findIndex(v=>v.pageid === item.id);
                    if (index === -1)
                        item.agumentCount = 0;
                    else
                        item.agumentCount = values[0][index].agumentCount;
                    index = values[1].findIndex(v=>v.count === item.usercount);
                    item.name = values[1][index].name;
                });
            }
            resm.status = 1;
            resm.message = '查询成功!';
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//根据分类和关键字分页搜索页面(每一页最多10条数据)
router.get('/api/serchpage', function (req, res) {
    let resm = {status:0,message:'搜索失败!'};
    let category = req.query.category||'';//分类的取值
    let text = req.query.text||'';//搜索文本，会去文章title或discription中比对
    const page = parseInt(req.query.page);//查询的页数
    let order = req.query.order;//按什么方式排序，有orderArray中的值可取，若不是则默认为time
    const orderArray = ['likeCount','agumentCount','page.time'];
    let desc = req.query.desc==='asc'?'asc':'desc';//表示升序还是降序，默认升序
    const pagenum = 10;//表示一页最多可以获取到10条数据
    const start = (page-1)*pagenum;
    if (category){
        if (category === '所有分类')
            category = '';
        else
            category = ' and page.category="'+category+'" ';
    }
    if (text){
        text = ' and (page.title like "%'+text+'%" or page.discription like "%'+text+'%") '
    }
    if (!orderArray.includes(order)){
        order = 'page.time'
    }
    let sql = 'select page.id,user.name,page.title,page.url,page.usercount,page.version,page.discription,page.time,' +
        ' count(DISTINCT agument.id) as agumentCount,count(DISTINCT pagelike.id) as likeCount ' +
        ' from page left join agument on agument.pageid=page.id LEFT JOIN pagelike on pagelike.pageid=page.id ,user' +
        ' where page.status="发表"'+category+text+' and user.count=page.usercount GROUP BY page.id order by '+
        order+' '+desc+' limit '+start+','+pagenum;
    db.querydb(sql)
        .then(data=>{
            resm.data = data;
            resm.status = 1;
            resm.message = '搜索成功!';
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//根据页面的id查询对该页面的更多评论
router.get('/api/loadmoreagument', function (req, res) {
    let resm = {status:0, message:'查询失败!'};
    const pagemun = 6;//一页查询6条数据
    const id = req.query.id;
    const page = req.query.page;
    const offset = req.query.offset;
    const start = parseInt((page-1)*pagemun)+parseInt(offset);
    db.querydb('select agument.*,user.name,user.touxiang from agument,user where pageid='+id+
        ' and user.count=agument.usercount ORDER BY agument.time DESC limit '+start+','+pagemun)
        .then(data=>{
            resm.aguments = data;
            //为查询评论的评论准备数据
            let parentids = '(';
            data.forEach(value=>{
                parentids += (value.id+',');
            });
            parentids = parentids.substring(0,parentids.length-1)+')';
            //若该页面还有评论，则进行子评论的查询，否则不查询
            if (data.length > 0)
                return db.querydb('select childagu.*,user.name,user.touxiang from childagu,user where parentid in '+parentids+' and user.count=childagu.usercount ORDER BY time ASC')
            else{
                return new Promise(resolve => {
                    resolve(1);
                })
            }
        })
        .then(data=>{
            if (data !== 1){//若有进行子评论的查询，则将查询结果添加到对应的评论中
                data.forEach(value=>{
                    let index = resm.aguments.findIndex(aguvalue => {
                        return aguvalue.id === value.parentid;
                    });
                    if (!resm.aguments[index].childagus)
                        resm.aguments[index].childagus = [];
                    resm.aguments[index].childagus.push(value);
                });
            }
            resm.status = 1;
            resm.message = '查询成功!';
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//用于查询发表过的文章(根据发表人的账户，不包括页面的组件)
router.get('/api/querypublish', function (req, res) {
    let resm = {status:0,message:'查询失败!'};
    const count = req.query.count;
    if (!count){
        res.send(resm);
        return;
    }
    db.querydb('select * from page where usercount='+count+' and status="发表" order by time desc')
        .then(data=>{
            resm.status = 1;
            resm.message = '查询成功!';
            resm.data = data;
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//用于对发表的页面重新编辑(即生成一个该地址访问的最高版本，但是内容复制所点击编辑的那一条数据)
router.get('/api/updatepublish', function (req, res) {
    let resm = {status:0, message:'更新失败!'};
    const id = req.query.id;
    let newid = null;
    db.querydb('select page.version as maxv, t.* from page,(select * from page where id = '+id+') t ' +
        'where page.usercount=t.usercount and page.url=t.url ORDER BY page.version desc LIMIT 1')
        .then(data=>{
            if (data.length === 0){
                throw new Error('查询失败!');
            }
            let newData = data[0];
            newData.version = newData.maxv+1;
            newData.time = new Date().format('yyyy-MM-dd hh:mm:ss');
            newData.status = '草稿';
            return Promise.all([db.updatedb(db.creatInsertSql('page',newData,['maxv','id'])),
                db.querydb('select * from component where pageid='+id)]);
        })
        .then(data=>{
            if (data[0].affectedRows === 0){
                throw new Error('插入失败!');
            }
            newid = data[0].insertId;
            let componentData = data[1];
            let promiseArray = [];
            componentData.forEach((value)=>{
                value.pageid = newid;
                promiseArray.push(db.updatedb(db.creatInsertSql('component', value, ['cpid'])));
            });
            return Promise.all(promiseArray)
        })
        .then(data=>{
            resm.status = 1;
            resm.message = '新建成功!';
            resm.id = newid;
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//用于修改某个页面的可见性
router.get('/api/updatelookuser', function (req, res) {
    let resm = {status:0, message:'修改失败!'};
    db.updatedb('update page set lookuser="'+req.query.lookuser+'" where id='+req.query.id)
        .then(data=>{
            resm.status = 1;
            resm.message = '修改成功!';
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//对页面点赞
router.get('/api/addpagelike', function (req, res) {
    let resm = {status:0, message:'点赞失败!'};
    const pageid = req.query.pageid;
    const usercount = req.query.usercount;
    if (!pageid || !usercount){
        res.send(resm);
        return;
    }
    Promise.all([db.querydb('select usercount from page where id = '+pageid+' limit 1'),
        db.querydb('select count(id) as count from pagelike where pageid = '+pageid+' and usercount='+usercount)])
        .then(data=>{
            //自己不能给自己写的文章点赞,并且同一个人不能对同一篇文章重复点赞
            if (data[0].length === 0 || data[0][0].usercount == usercount || data[1][0].count !== 0){
                throw new Error('点赞失败!');
            }
            return db.updatedb('insert into pagelike (pageid, usercount, time) values ('+pageid+','+
                usercount+',"'+(new Date()).format('yyyy-MM-dd hh:mm:ss')+'")')
        })
        .then(data=>{
            if (data.affectedRows === 1){
                resm.status = 1;
                resm.message = '点赞成功!';
            }
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//关注某个人
router.get('/api/addfollow', function (req, res) {
    let resm = {status:0, message:'关注失败!'};
    const byfollowuc = req.query.byfollowuc;
    const followuc = req.query.followuc;
    if (!byfollowuc || !followuc){
        res.send(resm);
        return;
    }
    //自己不能关注自己
    if (byfollowuc === followuc){
        res.send(resm);
        return;
    }
    db.querydb('select count(id) as count from follow where byfollowuc='+byfollowuc+' and followuc='+followuc)
        .then(data=>{
            //同一个人不能被另一个人重复关注
            if (data[0].count !== 0){
                throw new Error('关注失败!');
            }
            return db.updatedb('insert into follow (byfollowuc, followuc, time) values ('+byfollowuc+','+
                followuc+',"'+(new Date()).format('yyyy-MM-dd hh:mm:ss')+'")')
        })
        .then(data=>{
            if (data.affectedRows === 1){
                resm.status = 1;
                resm.message = '关注成功!';
            }
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//提交评论
router.post('/api/addagument', function (req, res) {
    let resm = {status:0, message:'提交评论失败!'};
    let xinxi = req.body;
    if (!xinxi.pageid || !xinxi.usercount || !xinxi.content || xinxi.content.length>200){
        res.send(resm);
        return;
    }
    xinxi.time = (new Date()).format('yyyy-MM-dd hh:mm:ss');
    db.updatedb(db.creatInsertSql('agument',xinxi))
        .then(data=>{
            if (data.affectedRows === 1){
                resm.status = 1;
                resm.message = '提交评论成功!';
                resm.data = {id:data.insertId,time:xinxi.time};
            }
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//提交评论的子评论
router.post('/api/addchildagu', function (req, res) {
    let resm = {status:0, message:'提交评论失败!'};
    let xinxi = req.body;
    if (!xinxi.parentid || !xinxi.usercount || !xinxi.content || xinxi.content.length>200){
        res.send(resm);
        return;
    }
    xinxi.time = (new Date()).format('yyyy-MM-dd hh:mm:ss');
    db.updatedb(db.creatInsertSql('childagu',xinxi))
        .then(data=>{
            if (data.affectedRows === 1){
                resm.status = 1;
                resm.message = '提交评论成功!';
                resm.data = {id:data.insertId,time:xinxi.time};
            }
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//查询某人的动态信息(包括名字，头像，文章数，关注数，评论数，总点赞数)
router.get('/api/getaction', function (req, res) {
    let resm = {status:0,message:'获取失败!'};
    const count = req.query.count;
    if (!count){
        res.send(resm);
        return;
    }
    Promise.all([db.querydb('select name,touxiang,count from user where count='+count+' limit 1'),
        db.querydb('select count(id) as pageCount from page where usercount='+count+' and status="发表"'),
        db.querydb('select followuc from follow where byfollowuc='+count),
        db.querydb('select count(id) as agumentCount from agument where usercount='+count),
        db.querydb('select count(pagelike.id) as likeCount from page,pagelike where page.usercount='+count
            + ' and page.status="发表" and page.id=pagelike.pageid')])
        .then(values=>{
            let data = values[0][0];
            data.pageCount = values[1][0].pageCount;
            data.follows = Array.from(values[2],v=>v.followuc);
            data.agumentCount = values[3][0].agumentCount;
            data.likeCount = values[4][0].likeCount;
            resm.status = 1;
            resm.message = '获取成功！';
            resm.data = data;
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//查询某用户与哪些用户互发过消息，并返回他们之间最后发的那一条消息
router.get('/api/getfirstmessage', function (req, res) {
    let resm = {status:0,message:'查询失败!'};
    const count = req.query.count;
    if (!count){
        res.send(resm);
        return;
    }
    Promise.all([db.querydb('select message.* from message, (select sender, max(time) as maxtime FROM message where resever='+count
        +' GROUP BY sender) as t where resever='+count+' and message.sender=t.sender and message.time = t.maxtime'),
        db.querydb('select message.* from message, (select resever, max(time) as maxtime FROM message where sender='+count
            +' GROUP BY resever) as t where sender='+count+' and message.resever=t.resever and message.time = t.maxtime'),
        db.querydb('select sender,count(id) as noread from message where resever='+count+' and isread="未读" GROUP BY sender')])
        .then(values => {
            let index = -1;
            let usercount = '(';
            for (let i = 0; i < values[0].length; i++){
                usercount = usercount+values[0][i].sender+',';
                //将未读的条数插入到对应的聊天信息里
                index = values[2].findIndex(v=>v.sender === values[0][i].sender);
                if (index !== -1){
                    values[0][i].noread = values[2][index].noread;
                }
                //判断同一个人的接收和发送哪一个更靠后，只保留靠后的那一条信息
                index = values[1].findIndex(v=>v && v.resever === values[0][i].sender);
                if (index !== -1){
                    if (new Date(values[1][index].time)>new Date(values[0][i].time))
                        values[0][i] = values[1][index];
                    delete values[1][index];
                }
            }
            //给第一个去重
            let data = [];
            values[0].forEach(v=>{
                let index = data.findIndex(item=>item.sender===v.sender);
                if (index === -1)
                    data.push(v);
            });
            let data1 = [];
            values[1].forEach(v=>{
                usercount = usercount+v.resever+',';
                let index = data1.findIndex(item=>item.resever===v.resever);
                if (index === -1)
                    data1.push(v);
            });
            data = [...data,...data1];
            resm.data = data;
            usercount = usercount.substring(0,usercount.length-1)+')';
            if (data.length === 0){
                return new Promise(resolve => {
                    resolve(1);
                });
            }
            else {
                return db.querydb('select count,touxiang,name,sex from user where count in '+usercount);
            }
        })
        .then(data=>{
            if (data !== 1){
                let index = -1;
                resm.data.forEach(item=>{
                    index = data.findIndex(v=>(v.count===item.sender || v.count===item.resever));
                    if (index === -1){
                        throw new Error('寻找失败!');
                    }
                    item.muser = data[index];
                });
            }
            resm.status = 1;
            resm.message = '查询成功!';
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//根据两个账户，获取这两个账户的聊天信息
router.get('/api/getmessages', function (req, res) {
    let resm = {status:0,message:'查询失败!'};
    const fcount = req.query.fcount;
    const lcount = req.query.lcount;
    const page = req.query.page;
    const offset = parseInt(req.query.offset);
    const pagenum = 20;
    const start = parseInt((page-1)*pagenum)+offset;
    if (!fcount || !lcount){
        res.send(resm);
        return;
    }
    db.querydb('select * from message where (sender='+fcount+' and resever='
        +lcount +') or (sender='+lcount+' and resever = '+fcount+
        ') ORDER BY time desc limit '+start+','+pagenum)
        .then(data=>{
            resm.data = data;
            resm.status = 1;
            resm.message = '查询成功!';
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//获取某个用户有多少条未读信息
router.get('/api/getnoreadmun', function (req, res) {
    let resm = {status:0,message:'查询失败!'};
    const count = req.query.count;
    if (!count){
        res.send(resm);
        return;
    }
    db.querydb('select count(id) as number from message where resever='+count+' and isread="未读"')
        .then(data=>{
            resm.status = 1;
            resm.message = '获取成功!';
            resm.number = data[0].number;
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//让数据库将一个接收者对一个发送者的所有信息标记为已读
router.get('/api/markread', function (req, res) {
    let resm = {status:0,message:'修改失败!'};
    const sender = req.query.sender;
    const resever = req.query.resever;
    if (!sender || !resever){
        res.send(resm);
        return;
    }
    db.updatedb('update message set isread="已读" where sender='+sender+' and resever='+resever+' and isread="未读"')
        .then(data=>{
            resm.status = 1;
            resm.message = '修改成功!';
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//让数据库将某一条信息标记为已读
router.get('/api/markreadbyid', function (req, res) {
    let resm = {status:0,message:'修改失败!'};
    const id = req.query.id;
    if (!id){
        res.send(resm);
        return;
    }
    db.updatedb('update message set isread="已读" where id='+id)
        .then(data=>{
            resm.status = 1;
            resm.message = '修改成功!';
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//查询某人的基本信息(包括头像，名字，账号，性别)
router.get('/api/userbaseinfo', function (req, res) {
    let resm = {status:0,message:'查询失败!'};
    const count = req.query.count;
    if (!count){
        res.send(resm);
        return;
    }
    db.querydb('select count,touxiang,name,sex from user where count = '+count)
        .then(data=>{
            if (data.length === 0)
                throw new Error('查询失败');
            resm.status = 1;
            resm.message = '查询成功!';
            resm.data = data[0];
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//将没有保存的数据保存到数据库的临时保存表中
router.post('/api/savetemp', function (req, res) {
    let resm = {status:0, message:'保存失败'};
    const usercount = req.body.usercount;
    const time = req.body.time;
    if (!usercount || !time){
        res.send(resm);
        return;
    }
    db.querydb('select id from temp where usercount='+usercount+' limit 1')
        .then(data=>{
            if (data.length === 0){
                return db.updatedb(db.creatInsertSql('temp',req.body));
            }
            else{
                resm.id = data[0].id;
                return db.updatedb("update temp set componentData='"+req.body.componentData+"' , pageConfig='"
                    +req.body.pageConfig+"' ,time='"+req.body.time+"' where id="+data[0].id);
            }
        })
        .then(data=>{
            if (data.affectedRows === 1){
                resm.status = 1;
                resm.message = '保存成功!';
                resm.id = resm.id || data.insertId;
            }
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//查询有没有未保存的数据
router.get('/api/queryhavetemp', function (req, res) {
    let resm = {status:0, message:'获取失败!'};
    const usercount = req.query.usercount;
    if (!usercount){
        res.send(resm);
        return;
    }
    db.querydb('select id from temp where usercount='+usercount+' limit 1')
        .then(data=>{
            if (data.length !== 0){
                resm.data = '有数据!';
            }
            resm.status = 1;
            resm.message = '获取成功!';
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//根据用户的账户获取临时保存表中的临时数据(若有则获取数据，然后删除该记录，表示用户已经获取过了，没有没保存的数据)
router.get('/api/querytemp', function (req, res) {
    let resm = {status:0, message:'获取失败!'};
    const usercount = req.query.usercount;
    if (!usercount){
        res.send(resm);
        return;
    }
    db.querydb('select * from temp where usercount='+usercount+' limit 1')
        .then(data=>{
            if (data.length === 1){
                //表示有没保存的数据
                resm.data = data[0];
            }
            resm.status = 1;
            resm.message = '获取成功!';
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//删除某人的临时保存数据
router.get('/api/deletetemp', function (req, res) {
    let resm = {status:0, message:'删除成功!'};
    const usercount = req.query.usercount;
    if (!usercount){
        res.send(resm);
        return;
    }
    db.updatedb('delete from temp where usercount='+usercount)
        .then(data=>{
            resm.status = 1;
            resm.message = '删除成功!';
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//接收用户传来的网页图片
router.post('/api/images',function (req, res) {
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = "./public/images";
    form.keepExtensions = true;//保留后缀
    form.maxFieldsSize = 20 * 1024 * 1024;
    //处理图片
    form.parse(req, function (err, fields, files) {
        var resm = {status:1,message:'上传图片成功!',path:''};
        if (err){
            resm.status = 0;
            resm.message = '上传图片失败!';
            return res.send(resm);
        }
        resm.path = files.file.path;
        res.send(resm);
    });
});

//用户反馈
router.post('/api/feedback', function (req, res) {
    let resm = {status:0, message:'反馈失败!'}
    const usercount = req.body.usercount;
    const type = req.body.type;
    const content = req.body.content;
    if (!usercount || !type || !content){
        resm.message = '参数不足';
        res.send(resm);
        return;
    }
    db.updatedb('insert into feedback (usercount,type,content,sendtime) values ('+
        usercount+',"'+type+'","'+content+'","'+(new Date()).format('yyyy-MM-dd hh:mm:ss')+'")')
        .then(data=>{
            if (data.affectedRows === 0)
                throw new Error('插入失败');
            resm.status = 1;
            resm.message = '反馈成功!';
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//将router导出
module.exports = router;