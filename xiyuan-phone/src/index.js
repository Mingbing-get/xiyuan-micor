import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import IsLogin from './page/islogin';

import 'antd/dist/antd.css';
import './base/base.js';
import './base/base.css';

import { createStore, compose } from 'redux';
import { Provider } from 'react-redux';
import rootApp from './redux/reducer/rootApp.js';

const store = new createStore(rootApp, compose());

ReactDOM.render(
    <Provider store={store}>
        <IsLogin>
            <App />
        </IsLogin>
    </Provider>,
  document.getElementById('root')
);
