//导入系统模块
const fs = require("fs");

exports.readfile = function (path) {
    return new Promise(function (resolve, reject) {
        fs.readFile(path, function (err, data) {
            if (err)
                reject(err);
            else
                resolve(data.toString());
        });
    });
};