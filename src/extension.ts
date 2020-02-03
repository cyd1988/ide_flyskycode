import * as vscode from 'vscode';

import { hover } from './com/hover';

import { Util } from './Util';
import { Api } from './lib/api';
import { outputChannel, AnyObj, JsonData } from './lib/const';
import path = require('path');
import fs = require('fs');
import { service as http } from './lib/httpIndex';


import { fileOpenProject } from './com/fileOpenProject';
import { editauto } from './com/edit';

let plugin = [
  fileOpenProject, hover, editauto
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
      if (autoregistertexteditor[args.fe]) {
        autoregistertexteditor[args.fe].main(textEditor, edit, args);
      }
    }));



  context.subscriptions.push(vscode.commands.registerCommand(
    'extension.demo.register', (args) => {
      import(`./autoregister/${args.fe}`).then(
        (utils) => { utils.main(args); }
      );
    }));


  context.subscriptions.push(vscode.commands.registerCommand(
    'extension.demo.api', (args) => {


      http.post(args.u, Object.assign(args.p)).then(res => {
        console.log(res);
        // Api.res(textEditor,edit,res,args);
        Api.res(res, args);

      });
    }));



  vscode.workspace.onDidSaveTextDocument((document) => {
    Util.getSystemInfo(function (msg: string) {
      outputChannel.appendLine(msg);
    });
  }, this);


  function getJsonData(document: vscode.TextDocument) {
    if (document.uri.fsPath.endsWith('cfig.json')) {
      let data: AnyObj = Util.getJsonData(document);
      JsonData.v = data;
    }
  }
  vscode.workspace.onDidOpenTextDocument((document) => {
    getJsonData(document);
  }, this);

  vscode.workspace.onDidChangeTextDocument((envs) => {
    getJsonData(envs.document);
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

