import * as vscode from 'vscode';

import {fileOpen} from './com/fileOpen';
import {fileOpenProject} from './com/fileOpenProject';
import {openAuto} from './com/openAuto';
import {runBash} from './com/runBash';
import {completion} from './completion';
import {helloword} from './helloword';
import {hover} from './hover';
import {Util} from './Util';
import {webview} from './webview';
import {welcome} from './welcome';



let plugin = [
  fileOpen, helloword, completion, hover, webview, welcome, openAuto, runBash,
  fileOpenProject

];

export function activate(this: any, context: vscode.ExtensionContext) {
  plugin.map(fun => {
    fun(context);
  });


  // 保存时自动调用
  const outputChannel = vscode.window.createOutputChannel('outputname');
  vscode.workspace.onDidSaveTextDocument((document) => {
    Util.getSystemInfo(function(msg: string) {
      outputChannel.appendLine(msg);
    });
  }, this);


  // 自动提示演示，在dependencies后面输入.会自动带出依赖
  // this.dependencies.
}

/**
 * 插件被释放时触发
 */
export function deactivate() {
  console.log('您的扩展“vscode-plugin-demo”已被释放！');
}
