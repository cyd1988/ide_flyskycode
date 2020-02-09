import axios from 'axios';
import { Util } from '../Util';
import * as vscode from 'vscode';
import { outputChannel, AnyObj, JsonData, StatusBarMessage } from './../lib/const';


// 配置开发和生产的请求接口
export const service = axios.create({
    // baseURL: process.env.VUE_APP_URL,
    timeout: 10000
});

// 设置header请求头，发起请求前做的事情
service.interceptors.request.use(
    config => {
        // config.headers.Authorization = store.state.user.token
        // config.headers['X-Requested-With'] = 'XMLHttpRequest';
        config.headers['Content-Type'] = 'application/json';


        config.url = config.url + '';
        if (!config.data.file) {
            config.data.file = Util.getProjectPath();
        }

        if (!config.data.jsondata) {
            config.data.jsondata = {};
        }
        config.data.jsondata = Util.merge(true, Util.getJsonData(), config.data.jsondata);

        config.data = JSON.stringify(config.data);

        const isProduction = process.env.NODE_ENV === 'production';
        if (!config.url.startsWith('http:')) {
            config.url = 'http://blog.laravel.flyskycode.cn/ide/v1' + config.url;
        }

        StatusBarMessage.setStatusBarMessage('f-net');

        return config;
    },
    error => {
        let msg: string = '请求错误！';
        if (typeof error === 'string') {
            msg = error;
        }
        Util.showError(msg);
        Promise.reject(error);
    }
);



// respone拦截器，发起请求后做的事情
service.interceptors.response.use(
    res => {
        StatusBarMessage.delStatusBarMessage('f-net');

        console.log('res', res);
        if (vscode.workspace.getConfiguration('flyskycode').get('netdebug')) {
            let msg = 'status:' + res.status + ', statusText:' + res.statusText;
            outputChannel.appendLine("\n");
            outputChannel.appendLine(msg);
            outputChannel.appendLine(JSON.stringify(res.config.url).replace(/\\"/g, '"'));
            outputChannel.appendLine(JSON.stringify(res.config.method).replace(/\\"/g, '"'));
            outputChannel.appendLine(JSON.stringify(res.config.data).replace(/\\"/g, '"'));

            let da = JSON.stringify(res.config.data);
            let bash = "curl -s '" + res.config.url +
                "' -H 'Content-Type: application/json;' --data-binary " + da + " ";
            outputChannel.appendLine(bash);
            outputChannel.appendLine(JSON.stringify(res.data).replace(/\\"/g, '"'));
        }

        // 当有新的token时自动更新新的token
        if (res.headers.authorization) {

        }
        if (typeof res.data.data === 'object' && res.data.data.show_msg) {
            Util.showInfo(res.data.data.show_msg);
        }
        if (res.data.status === 'success') {
            return Promise.resolve(res.data);
        } else {

            if (res.data.message) {
                Util.showError(res.data.message);
            }


            return Promise.reject(res.data);
        }
    },

    error => {
        StatusBarMessage.delStatusBarMessage('f-net');
        console.log(3434343);
        console.log('error', error);

        let msg = error.response.string;
        Util.showError(msg);
        return Promise.reject(error);
    }
);

export default service;
