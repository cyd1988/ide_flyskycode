// import axios from 'axios';
// import { Util } from '../Util';
// import * as vscode from 'vscode';
// import { outputChannel, StatusBarMessage, configUrl } from './../lib/const';
// import { MessageService } from './../lib/webSocket';
// import { Jsoncd_init, Jsoncd } from './../com/jsonOutline';
// import { ChangeTargetSshServer } from './../lib/ChangeTargetSshServer';


// // 配置开发和生产的请求接口
// export const service = axios.create({
//     // baseURL: process.env.VUE_APP_URL,
//     timeout: 10000
// });

// async function config_fn(config: any) {

//     // config.headers.Authorization = store.state.user.token
//     // config.headers['X-Requested-With'] = 'XMLHttpRequest';
//     config.headers['Content-Type'] = 'application/json';

//     config.url = config.url + '';
//     if (!config.data.file) {
//         config.data.file = Util.getProjectPath();
//     }

//     config.data.languageId = vscode.window.activeTextEditor ?
//         vscode.window.activeTextEditor.document.languageId :
//         null;

//     if (!config.data.jsondata) {
//         config.data.jsondata = {};
//     }

//     if (!config.data.notGetJsonData) {
//         config.data.jsondata = Util.merge(true, Util.getJsonData(), config.data.jsondata);
//         // config.data.jsondata = Util.merge(true, Jsoncd.json.getJson(), config.data.jsondata);
//     }

//     if (config.url != "/account/getSshAll") {

//         if (!config.data.jsondata['ssh'] || config.data.jsondata['ssh'].length < 2) {
//             ChangeTargetSshServer.getListCurrent('null');
//             let back: any = await ChangeTargetSshServer.getListCurrent();
//             config.data.jsondata['ssh'] = back.key;

//         } else {
//             if (config.data.jsondata['ssh']) {
//                 ChangeTargetSshServer.getListCurrent(config.data.jsondata['ssh']);
//             } else {
//                 ChangeTargetSshServer.getListCurrent('null');
//             }
//         }
//     }


//     const isProduction = process.env.NODE_ENV === 'production';

//     if (!config.url.startsWith('http:')) {
//         config.url = configUrl + config.url;
//     }

    
//     console.log( '343434343----------' );
//     console.log( config );
   

//     MessageService.send(config);


//     if (!config.data.notGetJsonData) {
//         // StatusBarMessage.setStatusBarMessage('f-net');
//     }

//     // console.log(JSON.stringify(config));
//     config.cancelToken = new axios.CancelToken(cancel => {
//         cancel();
//     });


//     // this.source.cancel('Operation canceled by the user.');
//     // return;
//     return config;

// }


// // 设置header请求头，发起请求前做的事情
// service.interceptors.request.use(config_fn,
//     error => {
//         let msg: string = '请求错误！';
//         if (typeof error === 'string') {
//             msg = error;
//         }
//         // Util.showError(msg);
//         Promise.reject(error);
//     }
// );



// // respone拦截器，发起请求后做的事情
// service.interceptors.response.use(
//     res => {
//         // StatusBarMessage.delStatusBarMessage('f-net');

//         console.log('res', res);
//         if (vscode.workspace.getConfiguration('flyskycode').get('netdebug')) {
//             let msg = 'status:' + res.status + ', statusText:' + res.statusText;
//             outputChannel.appendLine("\n");
//             outputChannel.appendLine(msg);
//             outputChannel.appendLine(JSON.stringify(res.config.url).replace(/\\"/g, '"'));
//             outputChannel.appendLine(JSON.stringify(res.config.method).replace(/\\"/g, '"'));
//             outputChannel.appendLine(JSON.stringify(res.config.data).replace(/\\"/g, '"'));

//             let da = JSON.stringify(res.config.data);
//             let bash = "curl -s '" + res.config.url +
//                 "' -H 'Content-Type: application/json;' --data-binary " + da + " ";
//             outputChannel.appendLine(bash);
//             outputChannel.appendLine(JSON.stringify(res.data).replace(/\\"/g, '"'));
//         }

//         // 当有新的token时自动更新新的token
//         if (res.headers.authorization) {

//         }
//         if (typeof res.data.data === 'object' && res.data.data.show_msg) {
//             Util.showInfo(res.data.data.show_msg);
//         }
//         if (res.data.status === 'success') {
//             return Promise.resolve(res.data);
//         } else {

//             if (res.data.message) {
//                 Util.showError(res.data.message);
//             }


//             return Promise.reject(res.data);
//         }
//     },

//     error => {
//         // StatusBarMessage.delStatusBarMessage('f-net');
//         // console.log('error', error);
//         // let msg = error.response.string;
//         // Util.showError(msg);
//         return Promise.reject(error);
//     }
// );

// export default service;




















