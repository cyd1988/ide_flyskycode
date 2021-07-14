import * as vscode from 'vscode';
import { Util } from '../Util';
import { outputChannel, AnyObj } from './../lib/const';
import fs = require('fs');
import { Api } from './../lib/api';
import { apiModel } from './../lib/apiModel';


export async function fun_list(lists: AnyObj, call_list?: (...args: any[]) => any) {
  let arr: any = [];
  let list_label: any = [];
  let fig: any = {
    canPickMany: false,               // 一个可选标志，使选择器接受多个选择，如果为true，则结果为选择数组。
    ignoreFocusOut: true,            // 设置为true可以在焦点移到编辑器的另一部分或另一个窗口时保持选择器处于打开状态。
    matchOnDescription: true,        // 筛选标志时包含描述的可选标志。
    matchOnDetail: true,             // 一个可选标志，用于在筛选选项时包括详细信息
    placeHolder: '选择要打开的文件？',  // 在输入框
  };

  if (lists.hasOwnProperty('list_label')) {
    list_label = lists['list_label'];
  }

  if (lists.hasOwnProperty('list')) {
    for (const key in fig) {
      if (Object.prototype.hasOwnProperty.call(fig, key)) {
        if (Object.prototype.hasOwnProperty.call(lists, key)) {
          fig[key] = lists[key];
        }
      }
    }
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


      if (value.hasOwnProperty('to->list_label')) {

        let la_sp = value['to->list_label'].split(',,');
        let list_label_son = [];

        if (list_label.length > 0) {

          let label_ar: [] = la_sp[1].split(',');

          for (let index = 0; index < list_label.length; index++) {
            let element: any = list_label[index];

            // 过滤列表
            if (label_ar.find((v) => v == element.label)) {
              if (element.hasOwnProperty('to->v')) {
                element = Util.str_to_obj(element, element['to->v'], value.value);
              }
              list_label_son.push(element);
            }

          }
        }

        value = Util.str_to_obj(value, la_sp[0], list_label_son);
      }


      if (value.hasOwnProperty('run')) {
        Api.run(value);
      } else if (value.hasOwnProperty('path')) {
        let source_val = value.path + '';
        let val: string = source_val.trim();

        if (fs.existsSync(val)) {
          apiModel.r_open_file({ 'file': val });

        } else {
          let editor = vscode.window.activeTextEditor;
          if (editor && editor.selections.length > 0) {
            let pos: vscode.Position = editor.selections[0].start;
            let uri = [{ "key": 'insert', "line": pos.line, 'char': pos.character, 'con': source_val }];
            vscode.commands.executeCommand('extension.demo.edit', uri);
          } else {
            outputChannel.show();
            outputChannel.clear();
            outputChannel.appendLine(val);
          }
        }
      } else {
        console.log('showQuickPick_value_else_error_not path', value);
      }
    });
}

