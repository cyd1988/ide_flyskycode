import * as vscode from 'vscode';
import { Util } from '../Util';
import { service as http } from '../lib/httpIndex';
import { outputChannel, AnyObj } from './../lib/const';
import fs = require('fs');
import { Api } from './../lib/api';



export async function fun_list(lists: AnyObj, call_list?: (...args: any[]) => any) {
  let arr: any = [];
  let fig = {
    'list': '',
    canPickMany: false,               // 一个可选标志，使选择器接受多个选择，如果为true，则结果为选择数组。
    ignoreFocusOut: true,            // 设置为true可以在焦点移到编辑器的另一部分或另一个窗口时保持选择器处于打开状态。
    matchOnDescription: true,        // 筛选标志时包含描述的可选标志。
    matchOnDetail: true,             // 一个可选标志，用于在筛选选项时包括详细信息
    placeHolder: '选择要打开的文件？',  // 在输入框
  };

  if (lists.hasOwnProperty('list')) {
    fig = Util.merge(true, fig, lists);
    delete (fig['list']);
    lists = lists['list'];
  }

  if (call_list) {
    arr = call_list(lists);
  } else {
    for (const key in lists) {
      if (lists.hasOwnProperty(key)) {
        const element = lists[key].list;
        element.forEach((v: any) => {
          arr.push({ 'label': v.name, 'path': v.val });
        });
      }
    }
  }

  vscode.window
    .showQuickPick(arr,
      {
        canPickMany: fig.canPickMany,
        ignoreFocusOut: fig.ignoreFocusOut,
        matchOnDescription: fig.matchOnDescription,
        matchOnDetail: fig.matchOnDetail,
        placeHolder: fig.placeHolder,
        onDidSelectItem: function (item) {
          // console.log('aaa ', item);
        }
      })
    .then((value: any) => {
      if (typeof value === 'undefined') {
        return;
      }

      if (typeof value !== 'object') {
        console.log('lists', lists);
        console.log('value', value);
        return;
      }

      if (value.hasOwnProperty('run')) {
        Api.run(value);
      } else {
        let val: string = (value.path + '').trim();

        if (fs.existsSync(val)) {
          let uri = vscode.Uri.file(val);
          vscode.commands.executeCommand('vscode.openFolder', uri);
        } else {
          let editor = vscode.window.activeTextEditor;
          if (editor && editor.selections.length > 0) {
            let pos: vscode.Position = editor.selections[0].start;
            let uri = [{ "key": 'insert', "line": pos.line, 'char': pos.character, 'con': val }];
            vscode.commands.executeCommand('extension.demo.edit', uri);
          } else {
            outputChannel.show();
            outputChannel.clear();
            outputChannel.appendLine(val);
          }
        }
      }
    });
}

