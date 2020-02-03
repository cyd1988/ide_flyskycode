import axios from 'axios';
import { Util } from '../Util';

// 配置开发和生产的请求接口
export const service = axios.create({
    // baseURL: process.env.VUE_APP_URL,
    timeout: 10000
});

// 设置header请求头，发起请求前做的事情
service.interceptors.request.use(
    config => {
        // config.headers.Authorization = store.state.user.token
        config.headers['X-Requested-With'] = 'XMLHttpRequest';

        config.url = config.url+'';
        if( !config.data.file ){
            config.data.file = Util.getProjectPath();
        }
        if(!config.data.jsonData){
            config.data.jsondata = Util.getJsonData();
        }

        const isProduction = process.env.NODE_ENV === 'production';
        if( !config.url.startsWith('http:') ){
            config.url = 'http://blog.laravel.flyskycode.cn/ide/v1' + config.url;
        }
        return config;
    },
    error => {
        Promise.reject(error);
    }
);

// respone拦截器，发起请求后做的事情
service.interceptors.response.use(
    res => {
        // 当有新的token时自动更新新的token
        if (res.headers.authorization) {

        }
        // window.vm.$loading.hide()
        // 统一处理错误
        // 在这里对返回的数据进行处理
        if (res.data.status === 'success') {
            return Promise.resolve(res.data);
        } else {
            console.log({
                title: '错误提示',
                desc: res.data.message,
                duration: 2
            });
            // Message({
            //   message: res.data.message,
            //   type: 'error',
            //   duration: 2000
            // })
        }
        // 打印错误信息
        return Promise.reject(res.data);
    },
    error => {
        if (error.response.status === 401) {
            // 登录过期
            console.log({
                title: '登录提示',
                desc: error.response.data.message,
                duration: 2,
                onClose() {

                }
            });

        } else if (error.response.status === 422) {
            // token过期
            console.log({
                title: '温馨提示',
                desc: error.response.data.message,
                duration: 2
            });

        } else if (error.response.status === 403) {
            // 没有权限
            console.log({
                title: '用户权限提示',
                desc: error.response.data.message,
                duration: 2,
                onClose() {
                }
            });
        } else if (error.response.status === 500) {
            // 服务器连接失败
            console.log({
                title: '网络提示',
                desc: '服务器连接失败，请稍后再试',
                duration: 2
            });
        } else {
            console.log({
                title: '错误提示 ' + error.response.status,
                desc: error.response.data.message,
                duration: 2
            });
        }
        return Promise.reject(error);
    }
);

export default service;
