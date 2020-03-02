import * as vscode from 'vscode';

import { hover } from './com/hover';

import { Util } from './Util';
import { Api } from './lib/api';
import { outputChannel, AnyObj } from './lib/const';
import path = require('path');
import fs = require('fs');
import { service as http } from './lib/httpIndex';


import { Jsoncd_init, Jsoncd } from './com/jsonOutline';
import { fileOpenProject } from './com/fileOpenProject';
import { editauto } from './com/edit';

let plugin = [
  fileOpenProject, hover, editauto, Jsoncd_init
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

  let commands: AnyObj[] = [
    {
      name: 'extension.demo.paste_link',
      names: '粘贴-软链接',
      'to->v': 'fsPath|p.api.p.dir',
      p: {
        run: 'api', api: {
          u: "/files/paste_link",
          p: { "dir": "" }
        }
      }
    },
    {
      name: 'extension.demo.shell_open',
      names: 'SHELL打开文件',
      'to->v': 'fsPath|p.api.p.file_name',
      p: {
        run: 'api', 
        api: {
          u: "/files/shell_open",
          p: { "file_name": "" }
        }
      }
    },


    // {
    //   name: 'extension.demo.paste_link',
    //   names: '粘贴-软链接',
    //   'to->v': 'fsPath|p.paste_link.dir',
    //   p: { run: 'paste_link', paste_link: { dir: '' } }
    // }
  ];

  console.log( commands );

  for (const key in commands) {
    if (commands.hasOwnProperty(key)) {
      let info = commands[key];
      context.subscriptions.push(vscode.commands.registerCommand(
        info.name, (args) => {
          info = Util.to_v(info, args);
          Api.run(info.p);
        }));
    }
  }

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

      function ruPost() {
        args.p = Api.argsRun(args.p);
        if (args.run) {
          Api.run(args);
        } else {
          http.post(args.u, Object.assign(args.p)).then(res => {
            Api.res(res, args);
          });
        }
      }

      if (args.save) {
        Util.docSave().then(ruPost);
      } else {
        ruPost();
      }

    }));

  vscode.workspace.onDidSaveTextDocument((document) => {
    Util.getSystemInfo(function (msg: string) {
      outputChannel.appendLine(msg);
    });
  }, this);


  function getJsonData(document: vscode.TextDocument) {
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

