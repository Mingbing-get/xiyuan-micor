import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
// 视图
import Main from './view/main';
import Followtop from './view/followtop';
import Liketop from './view/liketop';

//空页面
import Empty from './page/empty';

import Publish from './view/mine/publish';
import Action from './view/mine/action';
import Message from './view/mine/message';
import Feedback from './view/mine/feedback';
import Newpage from './view/mine/newpage';
import Persondata from './view/mine/persondata';
import Updatepassword from './view/mine/updatepassword';
import Draft from './view/mine/draft';

import ShowPage from './page/showpage';
import ShowSerch from './page/showserch';

class Routes extends Component {
    render() {
        return (
            <Switch>
                <Route exact path="/" component={Main} />
                <Route exact path="/followtop" component={Followtop} />
                <Route exact path="/liketop" component={Liketop} />

                <Route exact path="/empty" component={Empty} />

                <Route exact path="/mine/publish" component={Publish}></Route>
                <Route exact path="/action/:count" component={Action}></Route>
                <Route exact path="/mine/message/:count?" component={Message}></Route>
                <Route exact path="/mine/newpage/:id?" component={Newpage}></Route>
                <Route exact path="/mine/persondata" component={Persondata}></Route>
                <Route exact path="/mine/updatepassword" component={Updatepassword}></Route>
                <Route exact path="/mine/draft" component={Draft}></Route>
                <Route exact path="/mine/feedback" component={Feedback}></Route>

                <Route exact path="/showpage/:count/:url/:version?" component={ShowPage}></Route>
                <Route exact path="/showserch" component={ShowSerch}></Route>
            </Switch>
        )
    }
}
export default Routes;