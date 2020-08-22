import * as vscode from 'vscode';

import { hover } from './com/hover';
import { MessageService } from './lib/webSocket';

import { Util } from './Util';
import { Api } from './lib/api';
import { outputChannel, AnyObj } from './lib/const';
import path = require('path');
import fs = require('fs');
import { service as http } from './lib/httpIndex';


import { Jsoncd_init, Jsoncd } from './com/jsonOutline';
import { fileOpenProject } from './com/fileOpenProject';
import { editauto } from './com/edit';
import { apiModel } from './lib/apiModel';
import { Config } from './configurations/config';

import { ChangeTargetSshServer } from './lib/ChangeTargetSshServer';

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
      names: 'SHELL 打开文件',
      'to->v': 'fsPath|p.api.p.file_name',
      p: {
        run: 'api',
        api: {
          u: "/files/shell_open",
          p: { "file_name": "" }
        }
      }
    },
    {
      name: 'extension.demo.shell_paste',
      names: 'SHELL 粘贴',
      'to->v': 'fsPath|p.api.p.path',
      p: {
        run: 'api',
        api: {
          u: "/files/shell_paste",
          p: { "path": "" }
        }
      }
    },
    {
      name: 'extension.demo.sublime_list',
      names: '右键列表',
      'to->v': 'fsPath|p.api.p.SUBLIME_LIST_PATH',
      p: {
        run: 'api',
        api: {
          u: "/files/sublime_list",
          p: { "SUBLIME_LIST_PATH": "" }
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

  for (const key in commands) {
    if (commands.hasOwnProperty(key)) {
      let info = commands[key];
      context.subscriptions.push(vscode.commands.registerCommand(
        info.name, (args) => {
          if (args) {
            info = Util.to_v(info, args);
          }
          Api.run(info.p);
        }));
    }
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


  context.subscriptions.push(vscode.commands.registerCommand(
    'extension.demo.api', (args) => {
      if (!args.u) {
        let tm = args;
        args = { 'p': tm, 'u': '/init' };
      }


      // 测试
      if (args.p.hasOwnProperty('key') && args.p.key == 'ctrl+shift+alt+cmd+p') {
        apiModel.r_getText([
          {
            line: 2,
            char: 0,
            end_line: 8,
            end_char: 0,
          },
        ]
          , {});

        return;
        apiModel.r_open_file({
          file: '/Users/webS/www/mynotes/web/test/test.md',
          line: 0,
          KK: '陈斌',
        });
      }

      if (args.p.hasOwnProperty('key')){
        args.p.run_keyboard = args.p.key;
      }

      if (args.p.hasOwnProperty('key') && Config.sGet(args.p.key, false)) {
        const keys = args.p.key;
        args = JSON.parse(JSON.stringify(Config.sGet(args.p.key)));

        if (args.run && args[args.run].p) {
          args[args.run].p.run_keyboard = keys;
          args[args.run].p.keys = keys;
        }
      }

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

