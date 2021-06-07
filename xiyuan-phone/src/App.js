import React from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';
//导入页面
import Index from './page/index';
import Followtop from './page/followtop';
import Liketop from './page/liketop';
import Message from './page/message';
import Talk from './page/talk';
import Mine from './page/mine';
import ShowSerch from './page/showserch';
import Login from './page/login';
import Regist from './page/regist';
import Updatemine from './page/updatemine';
import Updatepassword from './page/updatepassword';
import Publish from './page/publish';
import Draft from './page/draft';
import Feedback from './page/feedback';
import Action from './page/action';
import Showpage from './page/showpage';

import Empty from './page/empty';

function App() {
  return (
    <div className="App">
        <HashRouter>
            <Switch>
                <Route exact path='/' component={Index}/>
                <Route exact path='/followtop' component={Followtop}/>
                <Route exact path='/liketop' component={Liketop}/>
                <Route exact path='/message' component={Message}/>
                <Route exact path='/talk/:count' component={Talk}/>
                <Route exact path='/mine' component={Mine}/>
                <Route exact path='/showserch' component={ShowSerch}/>
                <Route exact path='/login' component={Login}/>
                <Route exact path='/regist' component={Regist}/>
                <Route exact path='/updatemine' component={Updatemine}/>
                <Route exact path='/updatepassword' component={Updatepassword}/>
                <Route exact path='/publish' component={Publish}/>
                <Route exact path='/draft' component={Draft}/>
                <Route exact path='/feedback' component={Feedback}/>
                <Route exact path='/action/:count' component={Action}/>
                <Route exact path='/showpage/:count/:url/:version?' component={Showpage}/>
                <Route exact path='/empty' component={Empty}/>
            </Switch>
        </HashRouter>
    </div>
  );
}

export default App;
