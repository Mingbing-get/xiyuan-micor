import {Picture} from './pictures.js';

//继承Picture类
function ArcPic(parameter) {
    Picture.call(this,'A',parameter);
}
ArcPic.prototype = new Picture();
ArcPic.prototype.constructor = ArcPic;

//重写topath方法
ArcPic.prototype.toPath = function(){
    return this.command+this.parameter[0]+' '+this.parameter[1]+' '+this.parameter[2]+' '+
        this.parameter[3]+' '+this.parameter[4]+' '+this.parameter[5]+' '+this.parameter[6];
};
//重写addLocation方法
ArcPic.prototype.addLocation = function (incX, incY) {
    this.parameter[5] += incX;
    this.parameter[6] += incY;
};

export {ArcPic};