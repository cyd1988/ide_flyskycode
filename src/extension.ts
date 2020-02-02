import * as vscode from 'vscode';

import { hover } from './com/hover';

import { Util } from './Util';
import { outputChannel,AnyObj } from './lib/const';
import path = require('path');
import fs = require('fs');

import { fileOpenProject } from './com/fileOpenProject';

let plugin = [
  fileOpenProject,hover
];


let autoregistertexteditor: AnyObj = {};
async function runs() {
  let directory = Util.DIR() + '/src/autoregistertexteditor/';
  var files = fs.readdirSync(directory);
  for (var i = 0; i < files.length; i++) {
    let parse = path.parse(path.join(directory, files[i]));
    let utils = await import(`./autoregistertexteditor/${parse.name}`);
    autoregistertexteditor[parse.name] = utils;
  }
}
runs();



export function activate(this: any, context: vscode.ExtensionContext) {
  plugin.map(fun => { fun(context); });

  context.subscriptions.push(vscode.commands.registerTextEditorCommand(
    'extension.demo.registerTextEditor',
    (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, args) => {
      if(autoregistertexteditor[args.fe]){
        autoregistertexteditor[args.fe].main(textEditor, edit, args);
      }
    }));

  context.subscriptions.push(vscode.commands.registerCommand(
    'extension.demo.register', (args) => {
      import(`./autoregister/${args.fe}`).then(
        (utils) => { utils.main(args); }
      );
    }));

  vscode.workspace.onDidSaveTextDocument((document) => {
    Util.getSystemInfo(function (msg: string) {
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

