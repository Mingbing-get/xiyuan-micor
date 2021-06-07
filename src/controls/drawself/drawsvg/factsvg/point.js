function Point(x,y,control, extra) {
    this.x = x||0;
    this.y = y||0;
    this.control = control||[];
    this.extra = extra;
}

//改变位置
Point.prototype.changeLocation = function(x,y,picArray){
    this.x = x;
    this.y = y;
    picArray && this.control.forEach(value=>{
        picArray[value.arrin].changePoint({x,y},value.pic,picArray);
    });
};

//仅仅改变位置
Point.prototype.onlyAddPoint = function(x,y){
    this.x += x;
    this.y += y;
};

export {Point};