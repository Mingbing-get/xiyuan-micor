import {Picture} from './pictures.js';

//继承Picture类
function LinePic(parameter) {
    Picture.call(this,'L',parameter);
}
LinePic.prototype = new Picture();
LinePic.prototype.constructor = LinePic;

//重写topath方法
LinePic.prototype.toPath = function(){
    return this.command+this.parameter[0]+' '+this.parameter[1];
};
//重写addLocation方法
LinePic.prototype.addLocation = function (incX, incY) {
    this.parameter[0] += incX;
    this.parameter[1] += incY;
};

export {LinePic};