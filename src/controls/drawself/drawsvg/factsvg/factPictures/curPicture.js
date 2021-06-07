import {Picture} from './pictures.js';

//继承Picture类
function CurPic(parameter) {
    Picture.call(this,'C',parameter);
}
CurPic.prototype = new Picture();
CurPic.prototype.constructor = CurPic;

//重写topath方法
CurPic.prototype.toPath = function(){
    return this.command+this.parameter[0]+' '+this.parameter[1]+' '+this.parameter[2]+' '
        +this.parameter[3]+' '+this.parameter[4]+' '+this.parameter[5];
};
//重写addLocation方法
CurPic.prototype.addLocation = function (incX, incY) {
    this.parameter[0] += incX;
    this.parameter[1] += incY;
    this.parameter[2] += incX;
    this.parameter[3] += incY;
    this.parameter[4] += incX;
    this.parameter[5] += incY;
};

export {CurPic};