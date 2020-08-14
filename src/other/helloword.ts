import path = require('path');
import fs = require('fs');
import * as vscode from 'vscode';
import {Util}  from './../Util';

/**
 * 查找文件定义的provider，匹配到了就return一个location，否则不做处理
 * 最终效果是，当按住Ctrl键时，如果return了一个location，字符串就会变成一个可以点击的链接，否则无任何效果
 * @param {*} document 
 * @param {*} position 
 * @param {*} token 
 */
function provideDefinition(document: any, position: any, token: any) {
    const fileName    = document.fileName;
    const workDir     = path.dirname(fileName);
    const word        = document.getText(document.getWordRangeAtPosition(position));
    const line        = document.lineAt(position);
    const projectPath = Util.getProjectPath(document);

    console.log('====== 进入 provideDefinition 方法 ======');
    console.log('fileName: ' + fileName); // 当前文件名
    console.log('workDir: ' + workDir); // 当前文件所在目录
    console.log('word: ' + word); // 当前光标所在单词
    console.log('line: ' + line.text); // 当前光标所在行
    console.log('projectPath: ' + projectPath); // 当前工程目录
    
    if (/\/package\.json$/.test(fileName)) {
        console.log(word, line.text);
        const json = document.getText();
        // 这里我们偷懒只做一个简单的正则匹配
        if (new RegExp(`"(dependencies|devDependencies)":\\s*?\\{[\\s\\S]*?${word.replace(/\//g, '\\/')}[\\s\\S]*?\\}`, 'gm').test(json)) {
            let destPath = `${workDir}/node_modules/${word.replace(/"/g, '')}/README.md`;
            if (fs.existsSync(destPath)) {
                // new vscode.Position(0, 0) 表示跳转到某个文件的第一行第一列
                return new vscode.Location(vscode.Uri.file(destPath), new vscode.Position(0, 0));
            }
        }
    }
}


export function helloword(context: vscode.ExtensionContext ){

    // 注册如何实现跳转到定义，第一个参数表示仅对json文件生效
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(['json'], {
        provideDefinition
    }));

    context.subscriptions.push(vscode.commands.registerCommand('extension.sayHello', function() {
        vscode.window.showInformationMessage('Hello World!');
    }));


    // 注册HelloWord命令
    context.subscriptions.push(vscode.commands.registerCommand('extension.sayHello2', () => {
        vscode.window.showInformationMessage('Hello World！你好，小茗同学！');
    }));

    context.subscriptions.push(vscode.commands.registerCommand('extension.demo.getCurrentFilePath', (uri) => {
        vscode.window.showInformationMessage(`当前文件(夹)路径是：${uri ? uri.path : '空'}`);
    }));







    context.subscriptions.push(vscode.commands.registerCommand('extension.demo.testMenuShow', () => {
        vscode.window.showInformationMessage(`你点我干啥，我长得很帅吗？`);
    }));

    // // 获取所有命令
    // vscode.commands.getCommands().then((allCommands) => {
    //     console.log('所有命令：', allCommands);
    // });



    // 编辑器命令
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('extension.testEditorCommand',
     (textEditor, edit, Uri) => {

        console.log('您正在执行编辑器命令！');
        console.log(textEditor, edit);
    }));

    // 执行某个命令
    // vscode.commands.executeCommand('命令', 'params1', 'params2');


}