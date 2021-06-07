//导入配置选项
pz = require("./myconfig.js");

//导入第三方模块
const mysql = require("mysql");

//配置数据库选项
const db = mysql.createConnection({
    host : pz.host,
    user : pz.user,
    password : pz.password,
    database : pz.database
});

//链接数据库
db.connect((err)=>{
    if (err) return console.log("数据库链接失败");
    console.log("数据库链接成功");
});

//利用异步方法封装数据库函数
//查询数据库
exports.querydb = function (sql) {
   return new Promise(
      function(resolve, reject){
          db.query(sql, (err, result)=>{
              if (err)
                  reject(err);
              else
                  resolve(result);
          });
      }
  );
};
//删除，修改，增加
exports.updatedb = function (sql, post) {
   return new Promise(
       function (resolve, reject) {
           db.query(sql, post, (err, result)=>{
               if (err)
                   reject(err);
               else
                   resolve(result);
           });
       }
   )
};
//批量插入数据
exports.insertAll = function(sql, values){
    return new Promise(
        function (resolve, reject) {
            db.query(sql, [values], (err, result)=>{
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        }
    )
};
//传入表名和对象数据生成对应的插入sql语句
exports.creatInsertSql = function (tableName, data, exccept) {
    exccept = exccept || [];
    let keys = '';
    let values = '';
    for (let key in data){
        if (exccept.includes(key))
            continue;
        keys += key+',';
        values += "'"+data[key]+"',";
    }
    keys = keys.substring(0,keys.length-1);
    values = values.substring(0,values.length-1);
    let sql = 'insert into '+tableName+' ('+keys+') values ('+values+')';
    return sql;
};
//传入表名和对象数据以及条件的键生成对应的修改语句
exports.creatUpdateSql = function (tableName, data, whereKeys, exccept) {
    whereKeys = whereKeys || [];
    exccept = exccept || [];
    let updates = '';
    let wheres = '';
    for (let key in data){
        if (exccept.includes(key))
            continue;
        if (whereKeys.includes(key)){
            wheres = wheres + key+'="'+data[key]+'" and ';
        }
        else {
            updates = updates + key+'="'+data[key]+'" , ';
        }
    }
    updates = updates.substring(0,updates.length-3);
    wheres = wheres.substring(0,wheres.length-5);
    let sql = 'update '+tableName+' set '+updates+' where '+wheres;
    return sql;
};