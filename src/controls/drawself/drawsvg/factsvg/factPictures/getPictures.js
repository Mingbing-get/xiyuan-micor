import {MovePic} from './movePicture.js';
import {LinePic} from './linePicture.js';
import {ArcPic} from './arcPicture.js';
import {CurPic} from './curPicture.js';
import {HorPic} from './horPicture.js';
import {QuaPic} from './quaPicture.js';
import {SmoothPic} from './smoothPicture.js';
import {TquPic} from './tquPicture.js';
import {VerPic} from './verPicture.js';

const dictionary = {
    M:MovePic,
    L:LinePic,
    A:ArcPic,
    C:CurPic,
    H:HorPic,
    Q:QuaPic,
    S:SmoothPic,
    T:TquPic,
    V:VerPic,
};

function getPic(command, parameter) {
    return new dictionary[command](parameter);
}

export {getPic};