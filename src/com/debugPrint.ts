import * as vscode from 'vscode';

import {Config} from '../configurations/config';
import {Util} from '../Util';

var util = require('util');

let file = Util.DIR() + '/src/debug_print.json';
const debug_print: any = Config.loadConfig(file);


export function debugPrint(
    context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) {
  // context.subscriptions.push(vscode.commands.registerCommand(
  context.subscriptions.push(vscode.commands.registerTextEditorCommand(
      'extension.demo.debugPrint',
      function(
          textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, args) {
        const projectPath: string = Util.getFilePath();
        if (!projectPath) {
          return;
        }
        const data = Util.getJsonData();


        // 获取当前编辑器对象
        const editor = textEditor;
        if (!editor) {
          return false;
        }

        let ar = projectPath.split('.');
        let str_run:string="";
        let str_end:string="";

        let file_key = ar[ar.length - 1];


        for (const key in debug_print) {
          if (file_key === key) {
            str_run = debug_print[key]['str_run'];
            if (args['end']) {
              str_end = debug_print[key]['str_end'];
            } else {
              str_end = debug_print[key]['str_end_show'];
            }
            break;
          }
        }

        if (str_run.length < 1) {
          return;
        }
  
        let range;
        let selec = [];
        for (let index = editor.selections.length - 1; index >= 0; index--) {
          range = editor.selections[index];
          selec.push([
            range.start.line, range.start.character,
            editor.document.getText(range)
          ]);
        }

        selec = selec.sort((x: any, y: any) => {
          if (x[0] === y[0]) {
            return x[1] - y[1];
          } else {
            return x[0] - y[0];
          }
        });

        let line_ar = [];
        for (let index = 0; index < selec.length; index++) {
          if (str_run.indexOf('%') !== -1) {
            line_ar.push(util.format(str_run, selec[index][2]));
          } else {
            line_ar.push(str_run);
          }

          if (index + 1 === selec.length && str_end) {
            if (str_end.indexOf('%') !== -1) {
              line_ar.push(util.format(str_end, selec[index][2]));
            } else {
              line_ar.push(str_end);
            }
          }
        }

        let str_bas:string = editor.document.lineAt(parseInt(selec[selec.length - 1][0]+'')).text;
        str_bas = str_bas.replace(str_bas.trimLeft(),'' );

        let text = str_bas+line_ar.join(str_bas);
        
        let line = parseInt(selec[selec.length - 1][0] + '');
        let position_ins: vscode.Position = new vscode.Position(line + 1, 0);
        edit.insert(position_ins, text);  //代替文本,插入文本
      }));
}