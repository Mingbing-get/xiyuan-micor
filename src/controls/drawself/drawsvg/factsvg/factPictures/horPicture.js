import {Picture} from './pictures.js';

//继承Picture类
function HorPic(parameter) {
    Picture.call(this,'H',parameter);
}
HorPic.prototype = new Picture();
HorPic.prototype.constructor = HorPic;

//重写topath方法
HorPic.prototype.toPath = function(){
    return this.command+this.parameter[0];
};
//重写addLocation方法
HorPic.prototype.addLocation = function (incX) {
    this.parameter[0] += incX;
};

export {HorPic};