import * as vscode from 'vscode';

import {Util} from '../Util';
import fs = require('fs');
import {Config} from '../configurations/config';
const Configs: any = Config.configJsonContent();



function getConfigFile(uri: string, Configs: any) {
  let destPath;
  let keys = uri.substr(0, uri.length - 1);

  if (keys === 'cmd') {
    destPath = Configs.super_num.file[uri.substr(3)];
  } else if (keys === 'af') {
    destPath = Configs.afNum[uri].file;
  }
  return destPath;
}

function fun_af4(uri: string, Configs: any) {
  let destPaths = Configs['afNum'][uri].files;
  vscode.window
      .showQuickPick(
          destPaths.map((w: string) => {
            return {'label': Util.getProjectName(w), 'path': w};
          }),
          {
            // canPickMany: true, //
            // 一个可选标志，使选择器接受多个选择，如果为true，则结果为选择数组。
            ignoreFocusOut:
                true,  // 设置为true可以在焦点移到编辑器的另一部分或另一个窗口时保持选择器处于打开状态。
            matchOnDescription: true,  // 筛选标志时包含描述的可选标志。
            matchOnDetail: true,  // 一个可选标志，用于在筛选选项时包括详细信息
            placeHolder:
                '选择要打开的文件？',  // 在输入框中显示为占位符的可选字符串，以指导用户选择内容。
            onDidSelectItem: function(item) {
              // console.log('aaa ', item);
            }
          })
      .then((value: any) => {
        if (fs.existsSync(value.path)) {
          let uri = vscode.Uri.file(value.path);
          vscode.commands.executeCommand('vscode.openFolder', uri);
        }
      });
}



export function fileOpen(
    context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) {
  context.subscriptions.push(
      vscode.commands.registerCommand('extension.demo.fileOpen', function(uri) {
        const projectPath = Util.getFilePath();
        if (!projectPath) {
          return;
        }

        if (uri === 'cmd7') {
          outputChannel.show();
          outputChannel.clear();
          outputChannel.appendLine(projectPath);

        } else if (uri === 'af4') {
          fun_af4(uri, Configs);
        } else {
          let destPath = getConfigFile(uri, Configs);
          if (fs.existsSync(destPath)) {
            let uri = vscode.Uri.file(destPath);
            vscode.commands.executeCommand('vscode.openFolder', uri);
          }
        }
      }));
}