import {Picture} from './pictures.js';

//继承Picture类
function VerPic(parameter) {
    Picture.call(this,'V',parameter);
}
VerPic.prototype = new Picture();
VerPic.prototype.constructor = VerPic;

//重写topath方法
VerPic.prototype.toPath = function(){
    return this.command+this.parameter[0];
};
//重写addLocation方法
VerPic.prototype.addLocation = function (incX, incY) {
    this.parameter[0] += incY;
};

export {VerPic};