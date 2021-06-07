function Picture(command, parameter) {
    this.command = command||'';
    this.parameter = parameter||[];
}

Picture.prototype.setCommand = function (command) {
    //当指令确定之后，则不可以修改该指令的值
    if (this.command)
        return;
    this.command = command;
};

Picture.prototype.getCommand = function () {
    return this.command;
};

Picture.prototype.setParameter = function (parameter) {
    this.parameter = parameter;
};

Picture.prototype.getParameter = function () {
    return this.parameter;
};

Picture.prototype.toPath = function () {
    throw new Error('子类必须重写toPath方法');
};

Picture.prototype.addLocation = function () {
    throw new Error('子类必须重写addLocation方法');
};

export {Picture};