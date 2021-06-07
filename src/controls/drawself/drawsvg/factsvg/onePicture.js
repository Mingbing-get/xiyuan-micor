function OnePicture(picArray, colsePath, style, pointArray) {
    this.picArray = picArray || [];
    this.pointArray = pointArray || [];
    this.colsePath = colsePath || false;
    this.style = style || {};
    this.tempStyle = {};
}

//清空路径
OnePicture.prototype.clearpic = function () {
    this.picArray = [];
};
//删除某一个路径
OnePicture.prototype.deleteByIndex = function (index) {
    this.picArray = [...this.picArray.slice(0,index), ...this.picArray.slice(index+1)];
};
//增加一个路径
OnePicture.prototype.appendOne = function (obj, index) {
    if (index===0 || index)
        this.picArray[index] = obj;
    else
        this.picArray.push(obj);
};
//获取某一个路径
OnePicture.prototype.getByIndex = function (index) {
    return this.picArray[index];
};
//获取所有的pic
OnePicture.prototype.getPic = function () {
    return this.picArray;
};
//设置pic
OnePicture.prototype.setPic = function (picArray) {
    this.picArray = picArray;
};
//获取路径是否闭合
OnePicture.prototype.getColsePath = function(){
    return this.colsePath;
};
//设置路径是否闭合
OnePicture.prototype.setColsePath = function(colsePath){
    this.colsePath = colsePath || false;
};
//移动所有的路径
OnePicture.prototype.addAllLocation = function(incX, incY, picArray){
    this.pointArray.forEach(item=>{
        if (item.extra) //图形上面点的附属点必须要自己移动，因为当控制点变动的时候，会自动重新计算附属点的位置
            return;
        item.changeLocation(item.x+incX, item.y+incY,picArray);
    });
};
//设置样式
OnePicture.prototype.setStyle = function(style){
    this.style = style || {};
};
//获取样式
OnePicture.prototype.getStyle = function(){
    return this.style;
};
//设置临时样式
OnePicture.prototype.setTempStyle = function(style){
    this.tempStyle = style || {};
};
//获取临时样式
OnePicture.prototype.getTempStyle = function(){
    return this.tempStyle;
};
//将所有的路径组合为一个字符串返回
OnePicture.prototype.getPath = function () {
    let path = '';
    this.picArray.forEach(item=>{
        path = path+item.toPath()+' ';
    });
    if (this.colsePath){
        path = path+'Z';
    }
    return path;
};
//设置点
OnePicture.prototype.setPointArray = function(pointArray){
    this.pointArray = pointArray || [];
    this.afterSetPoint(pointArray);
};
OnePicture.prototype.afterSetPoint = function (pointArray) {
    throw new Error('子类必须实现afterSetPoint方法');
};
//获取点
OnePicture.prototype.getPointArray = function(){
    return this.pointArray;
};
//添加点
OnePicture.prototype.addPoint = function(point, index){
    if (index===0 || index)
        this.pointArray[index] = point;
    else
        this.pointArray.push(point);
    this.afterAddPoint(point, index);
};
OnePicture.prototype.afterAddPoint = function (point, index) {
    throw new Error('子类必须实现afterAddPoint方法');
};
//计算数组不是空的长度
OnePicture.prototype.notEmptyLength = function(arr){
    let num = 0;
    arr.forEach(v=>v&&num++);
    return num;
};
//改变某一个点的位置
OnePicture.prototype.changePoint = function (point, index, picArray) {
    this.afterChangePoint(this.pointArray[index], picArray);
};
OnePicture.prototype.afterChangePoint = function (point, picArray) {
    throw new Error('子类必须实现afterChangePoint方法');
};
//当点跟新后，用于同步点的位置
OnePicture.prototype.updatePic = function () {
    throw new Error('子类必须实现updatePic方法');
};
//用于显示对应的编辑界面
OnePicture.prototype.showEdit = function (picArray, callback) {
    throw new Error('子类必须实现showEdit方法');
};

export {OnePicture};