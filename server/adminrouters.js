//导入第三方模块
const express = require("express");
const formidable = require("formidable");
const compressing = require('compressing');
const stringRandom = require('string-random');
const fs = require('fs');

//导入自己的模块
const db = require("./db.js");
const readFile = require("./readfile.js");

const router = express.Router();

//设置开放文件夹的路径
const dir = __dirname;

router.get('/admin', function (req, res) {
    readFile.readfile(dir+'/public/admin/index.html')
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.send('找不到页面!');
        });
});

//登录
router.post('/admin/login', function (req, res) {
    let resm = {status:0, message:'error'};
    db.querydb('select count,name,sex,touxiang, level,status from admin where count = '+req.body.count+' and password = "'+req.body.password+'" limit 1')
        .then((data)=>{
            if (data.length === 1){
                req.session.admin = data[0];
                resm.admin = data[0];
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
router.get('/admin/islogin', function (req, res) {
    let resm = {status:0, message:'未登录'};
    if (req.session.admin){
        resm.status = 1;
        resm.message = '已登录';
        resm.admin = req.session.admin;
    }
    res.send(resm);
});

//获取用户头像
router.get('/admin/gettouxiang', function (req, res) {
    let resm = {status:0, message:'获取失败'};
    db.querydb('select touxiang from admin where count = "'+req.query.count+'" limit 1')
        .then((data)=>{
            if (data.length === 1){
                resm.touxiang = data[0].touxiang;
                resm.status = 1;
                resm.message = 'success';
            }
            res.send(resm);
        })
        .catch((error)=>{
            res.send(resm);
        });
});

//退出登录
router.get('/admin/logout', function (req, res) {
    let resm = {status:1, message:'退出成功!'};
    req.session.admin = null;
    res.send(resm);
});

//查看某个账户是否已经被注册
router.get('/admin/adminisregist', function (req, res) {
    let resm = {status:0, message:'该账户已经被注册!'};
    db.querydb('select count(count) as count from admin where count = '+req.query.count)
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
router.post('/admin/adminregist', function (req, res) {
    let resm = {status:0, message:'输入信息不符合规则!'};
    let xinxi = req.body;
    //数据验证
    if ( !xinxi.count || xinxi.count.length<5 || xinxi.count.length>11
        || !xinxi.name || xinxi.name.length>7
        || !xinxi.password || xinxi.password.length<6 || xinxi.password.length>20
        || !['男','女'].includes(xinxi.sex)){
        res.send(resm);
        return;
    }
    db.updatedb(db.creatInsertSql('admin', xinxi))
        .then(data=>{
            if (data.affectedRows === 1){
                resm.status = 1;
                resm.message = '注册成功!';
            }
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//处理头像
router.post('/admin/touxiang',function (req, res) {
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = "./public/admin/touxiang";
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

//管理员修改信息
router.post('/admin/updateadmin', function (req, res) {
    let resm = {status:0, message:'输入信息不符合规则!'};
    let xinxi = req.body;
    //数据验证
    if (!xinxi.count
        || (xinxi.name && xinxi.name.length>7)
        || (xinxi.sex && !['男','女'].includes(xinxi.sex))){
        res.send(resm);
        return;
    }
    db.updatedb(db.creatUpdateSql('admin',xinxi,['count'])+' limit 1')
        .then(data=>{
            if (data.affectedRows === 1){
                resm.status = 1;
                resm.message = '修改信息成功!';
                //修改保存在session中的数据
                for (let key in xinxi){
                    req.session.admin[key] = xinxi[key];
                }
            }
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//管理员修改密码
router.post('/admin/updatepassword', function (req, res) {
    let resm = {status:0, message:'输入信息不符合规则!'};
    if (req.body.password !== req.body.confirmPassword || req.body.password === req.body.oldPassword){
        res.send(resm);
        return;
    }
    db.updatedb('update admin set password = "'+req.body.password+
        '" where count="'+req.body.count+'" and password="'+req.body.oldPassword+'" limit 1')
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

//获取文章的信息以及它的点赞数评论数
router.get('/admin/getarticle', function (req, res) {
    let resm = {status:0, message:'获取失败'};
    let xinxi = req.query;
    const page = xinxi.page;
    if (!page){
        resm.message = '参数不足';
        res.send(resm);
        return;
    }
    const num = 15;
    const start = (parseInt(page)-1)*num;
    //条件
    let sqlwhere = '';
    for (let key in xinxi){
        if (key !== 'page' && key !== 'orderKey' && key !== 'order'){
            if (sqlwhere.length === 0){
                sqlwhere = ' where page.'+getsqlwhere(key, xinxi[key]);
            }
            else {
                sqlwhere = sqlwhere+'and page.'+getsqlwhere(key, xinxi[key]);
            }
        }
    }
    function getsqlwhere(key, value){
        let sqlw = '';
        if (key === 'usercount')
            sqlw = 'usercount like "%'+value+'%" ';
        else {
            let valueArray = value.replace(/，/g, ',').split(',');
            sqlw = key+' in (';
            valueArray.forEach(v=>{
                sqlw = sqlw+'"'+v+'",'
            });
            sqlw = sqlw.substring(0,sqlw.length-1)+') ';
        }
        return sqlw;
    };
    //排序
    let sqlorder = ' ORDER BY page.time desc';
    if (xinxi.orderKey){
        if (xinxi.orderKey === 'time'){
            sqlorder = ' ORDER BY page.time '+xinxi.order
        }
        else {
            sqlorder = ' ORDER BY '+xinxi.orderKey+' '+xinxi.order
        }
    }

    Promise.all([db.querydb('select count(page.id) as total from page '+sqlwhere),
        db.querydb('select page.*, count(agument.id) as agumentCount, count(pagelike.id) as likeCount ' +
            'from page LEFT JOIN agument on agument.pageid=page.id LEFT JOIN pagelike on pagelike.pageid=page.id' +
            sqlwhere+' GROUP BY page.id'+sqlorder+' limit '+start+' , '+num)])
        .then((data)=>{
            resm.status = 1;
            resm.message = '查询成功';
            resm.total = data[0][0].total;
            resm.data = data[1];
            res.send(resm);
        })
        .catch((error)=>{
            res.send(resm);
        });
});

//禁止或解禁某些文章
router.post('/admin/forbidarticle', function (req, res) {
    let resm = {status:0, message:'操作失败!'};
    const id = req.body.id;
    const forbid = req.body.forbid;
    if (!id || !forbid){
        res.send(resm);
        return;
    }
    Promise.all([db.updatedb('update page set status="'+forbid+'" where id in ('+id+')'),
        db.querydb('select usercount,title from page where id in ('+id+')')])
        .then(data=>{
            if (data[0].affectedRows > 0){
                resm.status = 1;
                resm.message = '操作成功!';
                if (forbid === '禁止')
                    return notify(data[1],'【禁止文章】 由于您的文章《title》中出现了不良信息，已被禁止！');
                else
                    return notify(data[1],'【解禁文章】 您的文章《title》已解禁，可以在 我的/发表 中看见了！');
            }
            else
                throw new Error('操作失败');
        })
        .then(data=>{
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//获取评论以及这些评论的子评论
router.get('/admin/getagument', function (req, res) {
    let resm = {status:0, message:'获取失败'};
    let xinxi = req.query;
    const page = xinxi.page;
    if (!page){
        resm.message = '参数不足';
        res.send(resm);
        return;
    }
    const num = 15;
    const start = (parseInt(page)-1)*num;

    //条件
    let sqlwhere = '';
    for (let key in xinxi){
        if (key !== 'page' && key !== 'orderKey' && key !== 'order'){
            if (sqlwhere.length === 0){
                sqlwhere = ' where '+getsqlwhere(key, xinxi[key]);
            }
            else {
                sqlwhere = sqlwhere+'and '+getsqlwhere(key, xinxi[key]);
            }
        }
    }
    function getsqlwhere(key, value){
        let sqlw = '';
        if (key === 'usercount')
            sqlw = 'usercount like "%'+value+'%" ';
        else {
            let valueArray = value.replace(/，/g, ',').split(',');
            sqlw = key+' in (';
            valueArray.forEach(v=>{
                sqlw = sqlw+'"'+v+'",'
            });
            sqlw = sqlw.substring(0,sqlw.length-1)+') ';
        }
        return sqlw;
    };
    //排序
    let sqlorder = ' ORDER BY time desc';
    if (xinxi.orderKey){
        sqlorder = ' ORDER BY '+xinxi.orderKey+' '+xinxi.order
    }

    Promise.all([db.querydb('select count(id) as total from agument '+sqlwhere),
        db.querydb('select * from agument '+sqlwhere+sqlorder+' limit '+start+','+num)])
        .then((data)=>{
            resm.status = 1;
            resm.message = '查询成功';
            resm.total = data[0][0].total;
            resm.data = data[1];
            if (data[1].length === 0){
                throw new Error('没有更多评论!');
            }
            let ids = '('+Array.from(data[1], v=>v.id).join(',')+')';
            return db.querydb('select * from childagu where parentid in '+ids);
        })
        .then(data=>{
            data.forEach(value=>{
                let index = resm.data.findIndex(v=>v.id===value.parentid);
                if (!resm.data[index].childagu)
                    resm.data[index].childagu = [value];
                else
                    resm.data[index].childagu.push(value);
            });
            res.send(resm);
        })
        .catch((error)=>{
            res.send(resm);
        });
});

//禁止或解禁某些评论
router.post('/admin/forbidagument', function (req, res) {
    let resm = {status:0, message:'操作失败!'};
    const id = req.body.id;
    const forbid = req.body.forbid;
    if (!id || !forbid){
        res.send(resm);
        return;
    }
    Promise.all([db.updatedb('update agument set status="'+forbid+'" where id in ('+id+')'),
        db.querydb('select usercount,content from agument where id in ('+id+')')])
        .then(data=>{
            if (data[0].affectedRows > 0){
                resm.status = 1;
                resm.message = '操作成功!';
                if (forbid === '禁止')
                    return notify(data[1],'【禁止评论】 由于您的评论（content）中出现了不良信息，已被禁止！');
                else
                    return notify(data[1],'【解禁评论】 您的评论（content）已解禁！');
            }
            else
                throw new Error('操作失败');
        })
        .then(data=>{
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//禁止或解禁某些子评论
router.post('/admin/forbidchildagu', function (req, res) {
    let resm = {status:0, message:'操作失败!'};
    const id = req.body.id;
    const forbid = req.body.forbid;
    if (!id || !forbid){
        res.send(resm);
        return;
    }
    Promise.all([db.updatedb('update childagu set status="'+forbid+'" where id in ('+id+')'),
        db.querydb('select usercount,content from childagu where id in ('+id+')')])
        .then(data=>{
            if (data[0].affectedRows > 0){
                resm.status = 1;
                resm.message = '操作成功!';
                if (forbid === '禁止')
                    return notify(data[1],'【禁止评论】 由于您的评论（content）中出现了不良信息，已被禁止！');
                else
                    return notify(data[1],'【解禁评论】 您的评论（content）已解禁！');
            }
            else
                throw new Error('操作失败');
        })
        .then(data=>{
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//发布通知
router.post('/admin/notify', function (req, res) {
    let resm = {status:0, message:'发布失败!'};
    const type = req.body.selecttype;
    let content = req.body.content;
    const title = req.body.title;
    const usercounts = req.body.usercounts;
    if (!type || !content || (type==='input' && !usercounts)){
        resm.message = '缺少参数';
        res.send(resm);
        return;
    }
    if (title)
        content = '【'+title+'】 '+content;
    if (type==='all'){
        db.querydb('select count from user where count != 111111')
            .then(data=>{
                return notifyString(Array.from(data, v=>v.count),content);
            })
            .then(data=>{
                resm.status = 1;
                resm.message = '发布成功!';
                res.send(resm);
            })
            .catch(error=>{
                res.send(resm);
            });
    }
    else {
        notifyString(usercounts.split(','),content)
            .then(data=>{
                resm.status = 1;
                resm.message = '发布成功!';
                res.send(resm);
            })
            .catch(error=>{
                res.send(resm);
            });
    }
});

/*给某些用户发送通知(data是一个数组，他的每一项是一个对象，
 并且其中必须要有有个usercount作为接收的用户，其余的键将会自动去字符串中匹配对应的值，
 若字符串中有该值则将这个值修改为键对应的值)*/
function notify(data, content){
    let time = new Date().format('yyyy-MM-dd hh:mm:ss');
    let values = Array.from(data, v=>{
        let tcon = content;
        for (let key in v){
            if (key !== 'usercount'){
                tcon = tcon.replace(new RegExp(key,'g'), v[key]);
            }
        }
        return ['111111',v.usercount,tcon,time,'未读'];
    });
    return new Promise(
        function (resolve, reject) {
            db.insertAll('INSERT INTO message(`sender`,`resever`,`content`, `time`, `isread`) VALUES ?',values)
                .then(data=>{
                    resolve(data);
                })
                .catch(error=>{
                    reject(error);
                });
        }
    )
};
function notifyString(usercounts, content){
    let time = new Date().format('yyyy-MM-dd hh:mm:ss');
    let values = Array.from(usercounts, v=>{
        return ['111111',v,content,time,'未读'];
    });
    return new Promise(
        function (resolve, reject) {
            db.insertAll('INSERT INTO message(`sender`,`resever`,' +
                '`content`, `time`, `isread`) VALUES ?',values)
                .then(data=>{
                    resolve(data);
                })
                .catch(error=>{
                    reject(error);
                });
        }
    )
};

//获取反馈问题
router.get('/admin/getfeedback', function (req, res) {
    let resm = {status:0, message:'获取失败'};
    let xinxi = req.query;
    const page = xinxi.page;
    if (!page){
        resm.message = '参数不足';
        res.send(resm);
        return;
    }
    const num = 15;
    const start = (parseInt(page)-1)*num;
    //条件
    let sqlwhere = '';
    for (let key in xinxi){
        if (key !== 'page' && key !== 'orderKey' && key !== 'order'){
            if (sqlwhere.length === 0){
                sqlwhere = ' where '+getsqlwhere(key, xinxi[key]);
            }
            else {
                sqlwhere = sqlwhere+'and '+getsqlwhere(key, xinxi[key]);
            }
        }
    }
    function getsqlwhere(key, value){
        let sqlw = '';
        if (key === 'usercount' || key === 'admincount')
            sqlw = ' '+key+' like "%'+value+'%" ';
        else {
            let valueArray = value.replace(/，/g, ',').split(',');
            sqlw = key+' in (';
            valueArray.forEach(v=>{
                sqlw = sqlw+'"'+v+'",'
            });
            sqlw = sqlw.substring(0,sqlw.length-1)+') ';
        }
        return sqlw;
    };
    //排序
    let sqlorder = ' ORDER BY sendtime desc';
    if (xinxi.orderKey){
        sqlorder = ' ORDER BY '+xinxi.orderKey+' '+xinxi.order
    }

    Promise.all([db.querydb('select count(id) as total from feedback '+sqlwhere),
        db.querydb('select * from feedback '+sqlwhere+sqlorder+' limit '+start+' , '+num)])
        .then((data)=>{
            resm.status = 1;
            resm.message = '查询成功';
            resm.total = data[0][0].total;
            resm.data = data[1];
            res.send(resm);
        })
        .catch((error)=>{
            res.send(resm);
        });
});

//将某些问题标记为已解决
router.post('/admin/resovlefeedback', function (req, res) {
    let resm = {status:0, message:'操作失败!'};
    const id = req.body.id;
    const admincount = req.body.admincount;
    const status = req.body.status;
    if (!id || !status || !admincount){
        res.send(resm);
        return;
    }
    let resovletime = new Date().format('yyyy-MM-dd hh:mm:ss');
    Promise.all([db.updatedb('update feedback set status="'+status+'", admincount='+admincount+',resovletime="'+resovletime+'" where id in ('+id+')'),
        db.querydb('select usercount,content from feedback where id in ('+id+')')])
        .then(data=>{
            if (data[0].affectedRows > 0){
                resm.status = 1;
                resm.data = {admincount,resovletime};
                resm.message = '操作成功!';
                return notify(data[1],'【反馈回复】 您的反馈（content）已解决！');
            }
            else
                throw new Error('操作失败');
        })
        .then(data=>{
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//获取管理员
router.get('/admin/getadminusers', function (req, res) {
    let resm = {status:0, message:'获取失败'};
    let xinxi = req.query;
    const page = xinxi.page;
    if (!page){
        resm.message = '参数不足';
        res.send(resm);
        return;
    }
    const num = 15;
    const start = (parseInt(page)-1)*num;
    //条件
    let sqlwhere = '';
    for (let key in xinxi){
        if (key !== 'page'){
            if (sqlwhere.length === 0){
                sqlwhere = ' where '+getsqlwhere(key, xinxi[key]);
            }
            else {
                sqlwhere = sqlwhere+'and '+getsqlwhere(key, xinxi[key]);
            }
        }
    }
    function getsqlwhere(key, value){
        let sqlw = '';
        if (key === 'count' || key === 'name')
            sqlw = ' '+key+' like "%'+value+'%" ';
        else {
            let valueArray = value.replace(/，/g, ',').split(',');
            sqlw = key+' in (';
            valueArray.forEach(v=>{
                sqlw = sqlw+'"'+v+'",'
            });
            sqlw = sqlw.substring(0,sqlw.length-1)+') ';
        }
        return sqlw;
    };

    Promise.all([db.querydb('select count(count) as total from admin '+sqlwhere),
        db.querydb('select count,name,sex,level,status from admin '+sqlwhere+' limit '+start+' , '+num)])
        .then((data)=>{
            resm.status = 1;
            resm.message = '查询成功';
            resm.total = data[0][0].total;
            resm.data = data[1];
            res.send(resm);
        })
        .catch((error)=>{
            res.send(resm);
        });
});

//禁止或解禁某些管理员
router.post('/admin/forbidadmin', function (req, res) {
    let resm = {status:0, message:'操作失败!'};
    const count = req.body.count;
    const status = req.body.status;
    if (!count || !status){
        res.send(resm);
        return;
    }
    db.updatedb('update admin set status="'+status+'" where count in ('+count+')')
        .then(data=>{
            if (data.affectedRows > 0){
                resm.status = 1;
                resm.message = '操作成功!';
            }
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//修改某些管理员的等级
router.post('/admin/updateadminlevel', function (req, res) {
    let resm = {status:0, message:'操作失败!'};
    const count = req.body.count;
    const level = req.body.level;
    if (!count || !level){
        res.send(resm);
        return;
    }
    db.updatedb('update admin set level="'+level+'" where count in ('+count+')')
        .then(data=>{
            if (data.affectedRows > 0){
                resm.status = 1;
                resm.message = '操作成功!';
            }
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//有关微应用的响应
//获取随机key
router.get('/admin/randomkey', function (req, res) {
    let resm = {status:1, message:'获取成功!'};
    resm.data = stringRandom(16, {numbers: false});
    res.send(resm);
});
//上传微应用文件
router.post('/admin/micorapp',function (req, res) {
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = "./public/micor";
    form.keepExtensions = true;//保留后缀
    //处理图片
    form.parse(req, function (err, fields, files) {
        var resm = {status:1,message:'上传文件成功!',path:''};
        if (err){
            resm.status = 0;
            resm.message = '上传文件失败!';
            return res.send(JSON.stringify(resm));
        }
        compressing.zip.uncompress(files.micor.path, './public/micor')
            .then(() => {
                fs.unlinkSync(files.micor.path);
                res.send(JSON.stringify(resm));
            })
            .catch(err => {
                fs.unlinkSync(files.micor.path);
                resm.status = 0;
                resm.message = '解压文件失败!';
                res.send(JSON.stringify(resm));
            });
    });
});
//上传微应用描述，并将信息保存到数据库中
router.post('/admin/savemicor', function (req, res) {
    let resm = {status:0, message:'输入信息不符合规则!'};
    const xinxi = req.body;
    if (!xinxi.micorkey || !xinxi.micorname || xinxi.micorname.length > 20
        || !xinxi.micordis || !xinxi.uploader){
        res.send(resm);
        return;
    }
    xinxi.time = new Date().format('yyyy-MM-dd hh:mm:ss');
    db.updatedb(db.creatInsertSql('microapp', xinxi))
        .then(data=>{
            if (data.affectedRows === 1){
                resm.status = 1;
                resm.message = '保存成功!';
            }
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});
//获取微应用信息
router.get('/admin/getmicor', function (req, res) {
    let resm = {status:0, message:'获取失败'};
    let xinxi = req.query;
    const page = xinxi.page;
    if (!page){
        resm.message = '参数不足';
        res.send(resm);
        return;
    }
    const num = 15;
    const start = (parseInt(page)-1)*num;
    //条件
    let sqlwhere = '';
    for (let key in xinxi){
        if (key !== 'page' && key !== 'orderKey' && key !== 'order'){
            if (sqlwhere.length === 0){
                sqlwhere = ' where '+getsqlwhere(key, xinxi[key]);
            }
            else {
                sqlwhere = sqlwhere+'and '+getsqlwhere(key, xinxi[key]);
            }
        }
    }
    function getsqlwhere(key, value){
        let sqlw = '';
        if (['micorname', 'micordis', 'uploader', 'looker'].includes(key))
            sqlw = key+' like "%'+value+'%" ';
        else {
            let valueArray = value.replace(/，/g, ',').split(',');
            sqlw = key+' in (';
            valueArray.forEach(v=>{
                sqlw = sqlw+'"'+v+'",'
            });
            sqlw = sqlw.substring(0,sqlw.length-1)+') ';
        }
        return sqlw;
    };
    //排序
    let sqlorder = ' ORDER BY time desc';
    if (xinxi.orderKey){
        if (xinxi.orderKey === 'time'){
            sqlorder = ' ORDER BY time '+xinxi.order
        }
        else {
            sqlorder = ' ORDER BY '+xinxi.orderKey+' '+xinxi.order
        }
    }
    Promise.all([db.querydb('select count(id) as total from microapp '+sqlwhere),
        db.querydb('select * from microapp'+sqlwhere+sqlorder+' limit '+start+' , '+num)])
        .then((data)=>{
            resm.status = 1;
            resm.message = '查询成功';
            resm.total = data[0][0].total;
            resm.data = data[1];
            res.send(resm);
        })
        .catch((error)=>{
            res.send(resm);
        });
});
//修改微应用的可见性
router.post('/admin/updatelooker', function (req, res) {
    let resm = {status:0, message:'操作失败!'};
    const id = req.body.id;
    const looker = req.body.looker;
    if (!id || !looker){
        res.send(resm);
        return;
    }
    const sql = looker==="any"
        ? 'update microapp set looker="'+'" where id in ('+id+')'
        : 'update microapp set looker="'+looker+'" where id in ('+id+')';
    db.updatedb(sql)
        .then(data=>{
            if (data.affectedRows > 0){
                resm.status = 1;
                resm.message = '操作成功!';
            }
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//获取统计图数据
//初始化时获取用户的count，sex，birthday
router.get('/admin/stuserinfo', function (req, res) {
    let resm = {status:0, message:'获取失败!'};
    db.querydb('select count,sex,birthday from user where count != 111111')
        .then(data=>{
            resm.status = 1;
            resm.message = '获取成功!';
            resm.data = data;
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//获取用户评论数
router.get('/admin/stuseragument', function (req, res) {
    let resm = {status:0, message:'获取失败!'};
    db.querydb('select usercount, count(id) as count from agument GROUP BY usercount')
        .then(data=>{
            resm.status = 1;
            resm.message = '获取成功!';
            resm.data = data;
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//获取用户关注的人数
router.get('/admin/stuserfollow', function (req, res) {
    let resm = {status:0, message:'获取失败!'};
    db.querydb('select followuc, count(id) as count from follow GROUP BY followuc')
        .then(data=>{
            resm.status = 1;
            resm.message = '获取成功!';
            resm.data = data;
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//获取用户被关注的人数
router.get('/admin/stuserbyfollow', function (req, res) {
    let resm = {status:0, message:'获取失败!'};
    db.querydb('select byfollowuc, count(id) as count from follow GROUP BY byfollowuc')
        .then(data=>{
            resm.status = 1;
            resm.message = '获取成功!';
            resm.data = data;
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//获取用户点赞数
router.get('/admin/stuserlike', function (req, res) {
    let resm = {status:0, message:'获取失败!'};
    db.querydb('select usercount, count(id) as count from pagelike GROUP BY usercount')
        .then(data=>{
            resm.status = 1;
            resm.message = '获取成功!';
            resm.data = data;
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//获取用户文章数
router.get('/admin/stuserpage', function (req, res) {
    let resm = {status:0, message:'获取失败!'};
    db.querydb('select usercount, count(id) as count from page GROUP BY usercount')
        .then(data=>{
            resm.status = 1;
            resm.message = '获取成功!';
            resm.data = data;
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//获取文章基本信息
router.get('/admin/stpageinfo', function (req, res) {
    let resm = {status:0, message:'获取失败!'};
    db.querydb('select status,lookuser,category FROM page')
        .then(data=>{
            resm.status = 1;
            resm.message = '获取成功!';
            resm.data = data;
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//获取文章的评论数
router.get('/admin/stpageagument', function (req, res) {
    let resm = {status:0, message:'获取失败!'};
    db.querydb('select pageid, count(id) as count from agument GROUP BY pageid')
        .then(data=>{
            resm.status = 1;
            resm.message = '获取成功!';
            resm.data = data;
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//获取文章的点赞数
router.get('/admin/stpagelike', function (req, res) {
    let resm = {status:0, message:'获取失败!'};
    db.querydb('select pageid, count(id) as count from pagelike GROUP BY pageid')
        .then(data=>{
            resm.status = 1;
            resm.message = '获取成功!';
            resm.data = data;
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//获取组件的使用情况
router.get('/admin/stcomponent', function (req, res) {
    let resm = {status:0, message:'获取失败!'};
    db.querydb('select cpname, micorname, count(cpid) as count FROM component LEFT JOIN microapp ON cpname=micorkey GROUP BY cpname')
        .then(data=>{
            resm.status = 1;
            resm.message = '获取成功!';
            resm.data = data;
            res.send(resm);
        })
        .catch(error=>{
            res.send(resm);
        });
});

//将router导出
module.exports = router;