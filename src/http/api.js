import { httpGet, httpPost } from "./http.js";
import base from './base.js';

const api = {
    //登录
    login(params){
        return httpPost(base.baseUrl+base.login,params);
    },
    //判断是否登录
    islogin(){
        return httpGet(base.baseUrl+base.islogin);
    },
    //退出登录
    logout(){
        return httpGet(base.baseUrl+base.logout);
    },
    //判断某个账户是否已被注册
    isregist(count){
        return httpGet(base.baseUrl+base.isregist+'?count='+count);
    },
    //注册
    regist(params){
        return httpPost(base.baseUrl+base.regist,params);
    },
    //修改个人信息
    updateuser(params){
        return httpPost(base.baseUrl+base.updateuser,params);
    },
    //修改密码
    updatepassword(params){
        return httpPost(base.baseUrl+base.updatepassword,params);
    },
    //检查提供的url是否可用
    availableurl(count, url){
        return httpGet(base.baseUrl+base.availableurl+'?count='+count+'&url='+url);
    },
    //获取某个用户需要显示的组件
    showcomponent(config){
        let urlData = '?';
        for (let key in config){
            urlData = urlData+key+'='+config[key];
        }
        return httpGet(base.baseUrl+base.showcomponent+urlData);
    },
    //保存页面信息
    savepage(params){
        return httpPost(base.baseUrl+base.savepage,params);
    },
    //发表网页
    publish(params){
        return httpPost(base.baseUrl+base.publish,params);
    },
    //查询草稿
    querydraft(count){
        return httpGet(base.baseUrl+base.querydraft+'?count='+count);
    },
    //删除某一篇文章
    deletepage(id){
        return httpGet(base.baseUrl+base.deletepage+'?id='+id);
    },
    //查询页面的所有数据(包括组件)
    querypage(id){
        return httpGet(base.baseUrl+base.querypage+'?id='+id);
    },
    //查询页面所有数据(包括组件和作者)
    querypageandwriter(id, count){
        if (!count)
            return httpGet(base.baseUrl+base.querypageandwriter+'?id='+id);
        else
            return httpGet(base.baseUrl+base.querypageandwriter+'?id='+id+'&count='+count);
    },
    //根据版本查询页面的所有数据(包括组件和作者)
    querypagebyversion(usercount,url,version, count){
        let relurl = base.baseUrl+base.querypagebyversion+'?usercount='+usercount+'&url='+url;
        if (version)
            relurl += '&version='+version;
        if (count)
            relurl += '&count='+count;
        return httpGet(relurl);
    },
    //根据文章的id查询更多的评论数据
    loadmoreagument(id,page,offset){
        return httpGet(base.baseUrl+base.loadmoreagument+'?id='+id+'&page='+page+'&offset='+offset);
    },
    //查询某个用户发表的页面（不包括组件）
    querypublish(count){
        return httpGet(base.baseUrl+base.querypublish+'?count='+count);
    },
    //更新已经发布了的页面
    updatepublish(id){
        return httpGet(base.baseUrl+base.updatepublish+'?id='+id);
    },
    //修改某一篇文章的可见性
    updatelookuser(lookuser, id){
        return httpGet(base.baseUrl+base.updatelookuser+'?id='+id+'&lookuser='+lookuser);
    },
    //给文章点赞
    addpagelike(pageid,usercount){
        return httpGet(base.baseUrl+base.addpagelike+'?pageid='+pageid+'&usercount='+usercount);
    },
    //添加关注
    addfollow(byfollowuc, followuc){
        return httpGet(base.baseUrl+base.addfollow+'?byfollowuc='+byfollowuc+'&followuc='+followuc);
    },
    //提交评论
    addagument(params){
        return httpPost(base.baseUrl+base.addagument,params);
    },
    //提交评论的评论
    addchildagu(params){
        return httpPost(base.baseUrl+base.addchildagu,params);
    },
    //获取用户的信息(包括点赞数，关注数等)
    getaction(count){
        return httpGet(base.baseUrl+base.getaction+'?count='+count);
    },
    //获取某个用户发表的页面(不包括组件)和这些页面的点赞数和评论数
    queryuppage(count, page){
        return httpGet(base.baseUrl+base.queryuppage+'?count='+count+'&page='+page);
    },
    //获取某个用户的评论(包括评论的文章信息)
    queryuagument(count, page){
        return httpGet(base.baseUrl+base.queryuagument+'?count='+count+'&page='+page);
    },
    //获取某个用户的关注用户的信息和这些用户的评论数，文章数等
    queryubyfollow(count, page){
        return httpGet(base.baseUrl+base.queryubyfollow+'?count='+count+'&page='+page);
    },
    //查询某用户与哪些用户互发过消息，并返回他们之间最后发的那一条消息
    getfirstmessage(count){
        return httpGet(base.baseUrl+base.getfirstmessage+'?count='+count);
    },
    //查询两人之间的消息(包含分页查询，每页最多20条数据)
    getmessages(fcount, lcount, page, offset){
        return httpGet(base.baseUrl+base.getmessages+'?fcount='+fcount+'&lcount='+lcount+'&page='+page+'&offset='+offset);
    },
    //获取某个用户有多少条未读信息
    getnoreadmun(count){
        return httpGet(base.baseUrl+base.getnoreadmun+'?count='+count);
    },
    //将某个接收者和发送者的信息标记为已读
    markread(sender, resever){
        return httpGet(base.baseUrl+base.markread+'?sender='+sender+'&resever='+resever);
    },
    //将某条信息标记为已读
    markreadbyid(id){
        return httpGet(base.baseUrl+base.markreadbyid+'?id='+id);
    },
    //查询某人的基本信息
    userbaseinfo(count){
        return httpGet(base.baseUrl+base.userbaseinfo+'?count='+count);
    },
    //查询首页的数据(获取分类的点赞数前五篇文章)
    categorytopfive(){
        return httpGet(base.baseUrl+base.categorytopfive);
    },
    //搜索,需要传入一个对象，搜索的参数配置都写入该对象中
    serchpage(config){
        let serchurl = base.baseUrl+base.serchpage;
        let flag = false;
        for (let key in config){
            if (config[key]){
                if (!flag){
                    flag = true;
                    serchurl = serchurl+'?'+key+'='+config[key];
                }
                else
                    serchurl = serchurl+'&'+key+'='+config[key];
            }
        }
        return httpGet(serchurl);
    },
    //关注数排行
    followtop(page){
        return httpGet(base.baseUrl+base.followtop+'?page='+page);
    },
    //保存临时数据
    savetemp(params){
        return httpPost(base.baseUrl+base.savetemp,params);
    },
    //查询是否有临时数据
    queryhavetemp(usercount){
        return httpGet(base.baseUrl+base.queryhavetemp+'?usercount='+usercount);
    },
    //获取临时数据
    querytemp(usercount){
        return httpGet(base.baseUrl+base.querytemp+'?usercount='+usercount);
    },
    //删除某个用户的临时数据
    deletetemp(usercount){
        return httpGet(base.baseUrl+base.deletetemp+'?usercount='+usercount);
    },
    //用于提交反馈
    feedback(params){
        return httpPost(base.baseUrl+base.feedback,params);
    },
    //搜索样式组件
    serchmicor(serchText, count){
        return httpGet(base.baseUrl+base.serchmicor+'?serchText='+serchText+'&count='+count)
    },
    //用于提交添加样式
    addmicorgroup(params){
        return httpPost(base.baseUrl+base.addmicorgroup,params);
    },
    //用于删除某个分组
    deletemicorgroup(params){
        return httpPost(base.baseUrl+base.deletemicorgroup,params);
    },
    //用于删除某个样式
    deletesiglemicor(params){
        return httpPost(base.baseUrl+base.deletesiglemicor,params);
    }
};

export default api;