import fs = require('fs');
import path = require('path');
import * as vscode from 'vscode';
import {Util}  from './../Util';

/**
 * 从某个HTML文件读取能被Webview加载的HTML内容
 * @param {*} context 上下文
 * @param {*} templatePath 相对于插件根目录的html文件相对路径
 */
function getWebViewContent(context:any, templatePath:any) {
    const resourcePath = Util.getExtensionFileAbsolutePath(context, templatePath);
    const dirPath = path.dirname(resourcePath);
    let html = fs.readFileSync(resourcePath, 'utf-8');
    // vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
    html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
        return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
    });
    return html;
}

/**
 * 执行回调函数
 * @param {*} panel 
 * @param {*} message 
 * @param {*} resp 
 */
function invokeCallback(panel:any, message:any, resp:any) {
    console.log('回调消息：', resp);
    // 错误码在400-600之间的，默认弹出错误提示
    if (typeof resp === 'object' && resp.code && resp.code >= 400 && resp.code < 600) {
        Util.showError(resp.message || '发生未知错误！');
    }
    panel.webview.postMessage({cmd: 'vscodeCallback', cbid: message.cbid, data: resp});
}

/**
 * 存放所有消息回调函数，根据 message.cmd 来决定调用哪个方法
 */
const messageHandler:any = {
    getConfig(global:any, message:any) {
        const result = vscode.workspace.getConfiguration().get(message.key);
        invokeCallback(global.panel, message, result);
    },
    setConfig(global:any, message:any) {
        // 写入配置文件，注意，默认写入工作区配置，而不是用户配置，最后一个true表示写入全局用户配置
        vscode.workspace.getConfiguration().update(message.key, message.value, true);
        Util.showInfo('修改配置成功！');
    }
};

export function welcome(context:any) {

    context.subscriptions.push(vscode.commands.registerCommand('extension.demo.showWelcome', function (uri) {
        const panel = vscode.window.createWebviewPanel(
            'testWelcome', // viewType
            "自定义欢迎页", // 视图标题
            vscode.ViewColumn.One, // 显示在编辑器的哪个部位
            {
                enableScripts: true, // 启用JS，默认禁用
            }
        );
        let global = { panel};
        panel.webview.html = getWebViewContent(context, 'src/view/custom-welcome.html');
        panel.webview.onDidReceiveMessage(message => {
            if (messageHandler[message.cmd]) {
                messageHandler[message.cmd](global, message);
            } else {
                Util.showError(`未找到名为 ${message.cmd} 回调方法!`);
            }
        }, undefined, context.subscriptions);
    }));

    

    const key = 'vscodePluginDemo.showTip';
    // 如果设置里面开启了欢迎页显示，启动欢迎页
    if (vscode.workspace.getConfiguration().get(key)) {
        vscode.commands.executeCommand('extension.demo.showWelcome');
    }
}
