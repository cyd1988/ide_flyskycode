import * as vscode from 'vscode';

import { hover } from './com/hover';
import { MessageService } from './lib/webSocket';

import { Util } from './Util';
import { Api, ApiRun } from './lib/api';
import { outputChannel, AnyObj } from './lib/const';
import { fileOpenProject } from './com/fileOpenProject';
import { editauto } from './com/edit';
import { Config } from './configurations/config';

import { ChangeTargetSshServer } from './lib/ChangeTargetSshServer';

import { providers } from "./cop_path/providers";
import { subscribeToTsConfigChanges } from "./cop_path/configuration/tsconfig.service";


import Highlight from './cop_highlight_words/highlight';
import HighlightConfig from './cop_highlight_words/config';



let plugin = [
  fileOpenProject, hover, editauto
];

let autoregistertexteditor: AnyObj = {};
let activeEditor = vscode.window.activeTextEditor;

let version = "0.7.25"
outputChannel.show();
outputChannel.appendLine('flskycode-init..' + version);


console.log('ide: start' + version);

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

  ChangeTargetSshServer.init();  // 显示服务器列表（左下角）
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

  Highlight_updateConfig();
  if (activeEditor) Highlight_triggerUpdateDecorations();
  vscode.workspace.onDidChangeConfiguration(() => {
    Highlight_updateConfig()
  })

  vscode.window.onDidChangeVisibleTextEditors(function (editor) {
    Highlight.init().updateDecorations();
  }, null, context.subscriptions);

  vscode.workspace.onDidChangeTextDocument(function (event) {
    activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && event.document === activeEditor.document) {
      Highlight_triggerUpdateDecorations();
    }
  }, null, context.subscriptions);

  vscode.commands.registerCommand('highlightwords.addHighlight', function () {
    Highlight.init().addSelected()
  });
  vscode.commands.registerCommand('highlightwords.removeAllHighlights', function () {
    Highlight.init().clearAll()
  });

  vscode.commands.registerCommand('highlightwords.newAddHighlight', function () {
    Highlight.init().clearAll()
    Highlight.init().addSelected()
  });


  vscode.window.onDidChangeActiveTextEditor((Event) => {
    if (Event) {
      getJsonData(Event.document, 'onDidChangeActiveTextEditor');
    }
  }, this);

  vscode.workspace.onDidSaveTextDocument((document) => {
    ChangeTargetSshServer.up_get_num();
    getJsonData(document, 'onDidSaveTextDocument');
  }, this);

  vscode.workspace.onDidDeleteFiles(() => { ChangeTargetSshServer.up_get_num(); }, this);
  vscode.workspace.onDidCreateFiles(() => { ChangeTargetSshServer.up_get_num(); }, this);

  // vscode.workspace.onDidOpenTextDocument((document) => {
  //   getJsonData(document, 'onDidOpenTextDocument');
  // }, this);

  // vscode.workspace.onDidCloseTextDocument((document) => {
  //   getJsonData(document, 'onDidCloseTextDocument');
  // }, this);

  // 自动提示演示，在dependencies后面输入.会自动带出依赖
  // this.dependencies.

  subscribeToTsConfigChanges(context);


  function Highlight_updateConfig() {
    let configValues = HighlightConfig.getConfigValues()

    let obj = Highlight.init();
    obj.setDecorators(configValues.decorators)
    obj.setMode(configValues.defaultMode)

    // commands.executeCommand('setContext', 'showSidebar', configValues.showSidebar)
    console.log(3443);
  }
  var Highlight_timeout: NodeJS.Timer;
  function Highlight_triggerUpdateDecorations() {
    if (Highlight_timeout) {
      clearTimeout(Highlight_timeout);
    }
    Highlight_timeout = setTimeout(() => {
      Highlight.init().updateActive()
    }, 500);
  }






  /**
   * Register Providers
   * Add new providers in src/providers/
   * */
  providers.forEach((provider) => {
    const disposable = vscode.languages.registerCompletionItemProvider(
      provider.selector,
      provider.provider,
      ...(provider.triggerCharacters || [])
    );
    context.subscriptions.push(disposable);
  });

}








/**
 * 插件被释放时触发
 */
export function deactivate() {
  console.log('您的扩展“vscode-plugin-demo”已被释放！');
}



function getJsonData(document: vscode.TextDocument, type_name: string) {

  init_runs_commands();

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

let is_run__init_runs_commands = 0;

async function init_runs_commands() {
  if (is_run__init_runs_commands == 1) {
    return;
  }
  is_run__init_runs_commands = 1;

  vscode.commands
    .executeCommand("workbench.action.terminal.toggleTerminal")
    .then((sucess) => {

      vscode.commands.executeCommand("workbench.action.terminal.focus"); // 聚焦终端。这类似于切换，但如果终端可见，则聚焦终端而不是隐藏它。

      if (vscode.window.activeTextEditor) {
        vscode.window.showTextDocument(
          vscode.window.activeTextEditor.document.uri
        );
      }
    });
}