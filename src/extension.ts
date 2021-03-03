import * as vscode from 'vscode';

import { hover } from './com/hover';
import { MessageService } from './lib/webSocket';

import { Util } from './Util';
import { Api, ApiRun } from './lib/api';
import { outputChannel, AnyObj } from './lib/const';
import path = require('path');
import fs = require('fs');

import { fileOpenProject } from './com/fileOpenProject';
import { editauto } from './com/edit';
import { Config } from './configurations/config';

import { ChangeTargetSshServer } from './lib/ChangeTargetSshServer';


let plugin = [
  fileOpenProject, hover, editauto
];

let autoregistertexteditor: AnyObj = {};
// runs();

outputChannel.show();
outputChannel.appendLine('flskycode-init..');


console.log( 'ide: start' );

export function activate(this: any, context: vscode.ExtensionContext) {

  plugin.map(fun => { fun(context); });
  let data_fig = Config.configJsonContent();
  let commands: AnyObj[] = data_fig['commands']

  for (const key in commands) {
    let info = commands[key];
    context.subscriptions.push(vscode.commands.registerCommand(info.name, (args) => {
      info = Util.to_v(info, args);
      Api.run(info.p);
    }));
  }

  MessageService.start();


  context.subscriptions.push(
    vscode.commands.registerCommand('extension.demo.changeTargetSshServer',
      ChangeTargetSshServer.changeTargetLanguage));

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

  context.subscriptions.push(vscode.commands.registerCommand('extension.demo.api', ApiRun));

  vscode.window.onDidChangeActiveTextEditor((Event) => {
    if (Event) {
      getJsonData(Event.document, 'onDidChangeActiveTextEditor');
    }
  }, this);

  vscode.workspace.onDidSaveTextDocument((document) => {
    getJsonData(document, 'onDidSaveTextDocument');
  }, this);

  // vscode.workspace.onDidOpenTextDocument((document) => {
  //   getJsonData(document, 'onDidOpenTextDocument');
  // }, this);

  // vscode.workspace.onDidCloseTextDocument((document) => {
  //   getJsonData(document, 'onDidCloseTextDocument');
  // }, this);

  // 自动提示演示，在dependencies后面输入.会自动带出依赖
  // this.dependencies.
}








/**
 * 插件被释放时触发
 */
export function deactivate() {
  console.log('您的扩展“vscode-plugin-demo”已被释放！');
}



function getJsonData(document: vscode.TextDocument, type_name: string) {

  if (document.uri.query) {
    return;
  }

  let data = {
    'run': 'api',
    'api': {
      'u': '/envt/on_type',
      'p': {
        "run_file": document.uri.fsPath,
        "type_name": type_name,
      }
    }
  };
  Api.run(data);
}


async function runs() {
  let directory = Util.DIR() + '/src/autoregistertexteditor/';
  var files = fs.readdirSync(directory);
  for (var i = 0; i < files.length; i++) {
    let parse = path.parse(path.join(directory, files[i]));
    let utils = await import(`./autoregistertexteditor/${parse.name}`);
    autoregistertexteditor[parse.name] = utils;
  }
}