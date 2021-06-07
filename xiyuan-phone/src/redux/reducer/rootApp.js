//将所有的reducer都组合到一个根上面
import { combineReducers } from 'redux';
import loginReducer from './loginReducer.js';
import socketReducer from './socketReducer.js';
import noreadReaducer from './noreadReaducer.js';

export default combineReducers({loginReducer,socketReducer,noreadReaducer});