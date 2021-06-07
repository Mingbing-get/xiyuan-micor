import {Picture} from './pictures.js';

//继承Picture类
function QuaPic(parameter) {
    Picture.call(this,'Q',parameter);
}
QuaPic.prototype = new Picture();
QuaPic.prototype.constructor = QuaPic;

//重写topath方法
QuaPic.prototype.toPath = function(){
    return this.command+this.parameter[0]+' '+this.parameter[1]+' '+this.parameter[2]+' ' +this.parameter[3];
};
//重写addLocation方法
QuaPic.prototype.addLocation = function (incX, incY) {
    this.parameter[0] += incX;
    this.parameter[1] += incY;
    this.parameter[2] += incX;
    this.parameter[3] += incY;
};

export {QuaPic};