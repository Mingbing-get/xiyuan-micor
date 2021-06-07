import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import { createStore, compose } from 'redux';
import { Provider } from 'react-redux';
import rootApp from './redux/reducer/rootApp.js';

const store = new createStore(rootApp, compose());

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
