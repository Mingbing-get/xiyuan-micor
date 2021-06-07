import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import Article from '../../view/article';
import Agument from '../../view/agument';
import Notify from '../../view/notify';
import Statistic from '../../view/statistic';
import Micorapp from '../../view/micorapp';
import Feedback from '../../view/feedback';
import Adminusers from '../../view/adminusers';
import AdminInfo from '../../view/admininfo';

function Router() {
    return (
        <React.Fragment>
            <Redirect exact from='/index' to='/index/article'/>
            <Route exact path='/index/article' component={Article}/>
            <Route exact path='/index/agument' component={Agument}/>
            <Route exact path='/index/statistic' component={Statistic}/>
            <Route exact path='/index/micorapp' component={Micorapp}/>
            <Route exact path='/index/notify' component={Notify}/>
            <Route exact path='/index/feedback' component={Feedback}/>
            <Route exact path='/index/adminusers' component={Adminusers}/>
            <Route exact path='/index/adminInfo' component={AdminInfo}/>
        </React.Fragment>
    );
}

export default Router;