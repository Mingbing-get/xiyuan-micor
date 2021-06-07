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
    //获取管理员头像
    gettouxiang(count){
        return httpGet(base.baseUrl+base.gettouxiang+'?count='+count);
    },
    //退出登录
    logout(){
        return httpGet(base.baseUrl+base.logout);
    },
    //判断是否可以注册
    adminisregist(count){
        return httpGet(base.baseUrl+base.adminisregist+'?count='+count);
    },
    //管理员修改信息
    updateadmin(params){
        return httpPost(base.baseUrl+base.updateadmin,params);
    },
    //修改管理员的密码
    updatepassword(params){
        return httpPost(base.baseUrl+base.updatepassword,params);
    },
    //管理员注册
    adminregist(params){
        return httpPost(base.baseUrl+base.adminregist,params);
    },
    getarticle(config){
        let articleurl = base.baseUrl+base.getarticle+'?page='+config.page;
        for (let key in config){
            if (key !== 'page'){
                articleurl = articleurl+'&'+key+'='+config[key];
            }
        }
        return httpGet(articleurl);
    },
    forbidarticle(params){
        return httpPost(base.baseUrl+base.forbidarticle,params);
    },
    getagument(config){
        let articleurl = base.baseUrl+base.getagument+'?page='+config.page;
        for (let key in config){
            if (key !== 'page'){
                articleurl = articleurl+'&'+key+'='+config[key];
            }
        }
        return httpGet(articleurl);
    },
    forbidagument(params){
        return httpPost(base.baseUrl+base.forbidagument,params);
    },
    forbidchildagu(params){
        return httpPost(base.baseUrl+base.forbidchildagu,params);
    },
    notify(params){
        return httpPost(base.baseUrl+base.notify,params);
    },
    getfeedback(config) {
        let articleurl = base.baseUrl + base.getfeedback + '?page=' + config.page;
        for (let key in config) {
            if (key !== 'page') {
                articleurl = articleurl + '&' + key + '=' + config[key];
            }
        }
        return httpGet(articleurl);
    },
    resovlefeedback(params){
        return httpPost(base.baseUrl+base.resovlefeedback,params);
    },
    getadminusers(config) {
        let articleurl = base.baseUrl + base.getadminusers + '?page=' + config.page;
        for (let key in config) {
            if (key !== 'page') {
                articleurl = articleurl + '&' + key + '=' + config[key];
            }
        }
        return httpGet(articleurl);
    },
    forbidadmin(params){
        return httpPost(base.baseUrl+base.forbidadmin,params);
    },
    updateadminlevel(params){
        return httpPost(base.baseUrl+base.updateadminlevel,params);
    },
    //获取统计图数据
    //获取用户的count，sex，birthday
    stuserinfo(){
        return httpGet(base.baseUrl+base.stuserinfo);
    },
    //获取用户的评论数
    stuseragument(){
        return httpGet(base.baseUrl+base.stuseragument);
    },
    //获取关注的人数
    stuserfollow(){
        return httpGet(base.baseUrl+base.stuserfollow);
    },
    //获取被关注的人数
    stuserbyfollow(){
        return httpGet(base.baseUrl+base.stuserbyfollow);
    },
    //获取点赞数
    stuserlike(){
        return httpGet(base.baseUrl+base.stuserlike);
    },
    //获取文章数
    stuserpage(){
        return httpGet(base.baseUrl+base.stuserpage);
    },
    //获取文章基本信息(包括status，lookuser，category)
    stpageinfo(){
        return httpGet(base.baseUrl+base.stpageinfo);
    },
    //获取文章的评论数
    stpageagument(){
        return httpGet(base.baseUrl+base.stpageagument);
    },
    //获取文章的点赞数
    stpagelike(){
        return httpGet(base.baseUrl+base.stpagelike);
    },
    //获取组件的使用情况
    stcomponent(){
        return httpGet(base.baseUrl+base.stcomponent);
    },
    //获取随机key
    randomkey(){
        return httpGet(base.baseUrl+base.randomkey);
    },
    //保存微应用信息到数据库
    savemicor(params){
        return httpPost(base.baseUrl+base.savemicor, params);
    },
    //根据条件获取微应用的信息
    getmicor(config){
        let articleurl = base.baseUrl + base.getmicor + '?page=' + config.page;
        for (let key in config) {
            if (key !== 'page') {
                articleurl = articleurl + '&' + key + '=' + config[key];
            }
        }
        return httpGet(articleurl);
    },
    //修改组件的可见性
    updatelooker(params){
        return httpPost(base.baseUrl+base.updatelooker,params);
    },
};

export default api;