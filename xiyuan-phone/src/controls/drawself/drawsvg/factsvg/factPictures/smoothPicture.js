import {Picture} from './pictures.js';

//继承Picture类
function SmoothPic(parameter) {
    Picture.call(this,'S',parameter);
}
SmoothPic.prototype = new Picture();
SmoothPic.prototype.constructor = SmoothPic;

//重写topath方法
SmoothPic.prototype.toPath = function(){
    return this.command+this.parameter[0]+' '+this.parameter[1]+' '+this.parameter[2]+' ' +this.parameter[3];
};
//重写addLocation方法
SmoothPic.prototype.addLocation = function (incX, incY) {
    this.parameter[0] += incX;
    this.parameter[1] += incY;
    this.parameter[2] += incX;
    this.parameter[3] += incY;
};

export {SmoothPic};