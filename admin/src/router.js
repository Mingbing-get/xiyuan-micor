import React from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';

import Login from './page/login';
import Index from './page/index';

function Router() {
    return (
        <HashRouter>
            <Switch>
                <Route exact path='/login' component={Login}/>
                <Route path='/index' component={Index}/>
            </Switch>
        </HashRouter>
    );
}

export default Router;