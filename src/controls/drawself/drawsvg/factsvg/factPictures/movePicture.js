import {Picture} from './pictures.js';

//继承Picture类
function MovePic(parameter) {
    Picture.call(this,'M',parameter);
}
MovePic.prototype = new Picture();
MovePic.prototype.constructor = MovePic;

//重写topath方法
MovePic.prototype.toPath = function(){
    return this.command+this.parameter[0]+' '+this.parameter[1];
};
//重写addLocation方法
MovePic.prototype.addLocation = function (incX, incY) {
    this.parameter[0] += incX;
    this.parameter[1] += incY;
};

export {MovePic};