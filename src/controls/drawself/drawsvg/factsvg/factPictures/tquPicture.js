import {Picture} from './pictures.js';

//继承Picture类
function TquPic(parameter) {
    Picture.call(this,'T',parameter);
}
TquPic.prototype = new Picture();
TquPic.prototype.constructor = TquPic;

//重写topath方法
TquPic.prototype.toPath = function(){
    return this.command+this.parameter[0]+' '+this.parameter[1];
};
//重写addLocation方法
TquPic.prototype.addLocation = function (incX, incY) {
    this.parameter[0] += incX;
    this.parameter[1] += incY;
};

export {TquPic};