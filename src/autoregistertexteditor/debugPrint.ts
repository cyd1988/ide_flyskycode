import * as vscode from 'vscode';

import { Config } from '../configurations/config';
import { Util } from '../Util';

var util = require('util');

let file = Util.DIR() + '/src/debug_print.json';
const debug_print: any = Config.loadConfig(file);




export function main(
  textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any) {

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
  let str_run: string = "";
  let str_end: string = "";

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
  let selec: any[] = [];
  for (let index = editor.selections.length - 1; index >= 0; index--) {

    range = editor.selections[index];
    if (file_key === 'php' && range.start.character > 0) {
      let posins1 = new vscode.Position(range.start.line, range.start.character - 1);
      let posins2 = new vscode.Position(range.start.line, range.start.character + 1);
      let range_ins = new vscode.Range(posins1, posins2);
      let text = editor.document.getText(range_ins);
      if (!text.endsWith('$') && text.startsWith('$')) {
        posins1 = new vscode.Position(range.start.line, range.start.character - 1);
        range = new vscode.Range(posins1, range.end);

      }
    }

    selec.push([
      range.start.line,
      range.start.character,
      editor.document.getText(range),
      editor.document.lineAt(range.start.line).text
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

  // 获取选区中最后一行的空格
  let str_bas: string = editor.document.lineAt(parseInt(selec[selec.length - 1][0] + '')).text;
  str_bas = str_bas.replace(str_bas.trimLeft(), '');

  let text = str_bas + line_ar.join(str_bas);

  let line = parseInt(selec[selec.length - 1][0] + '');
  let position_ins: vscode.Position = new vscode.Position(line + 1, 0);


  async function add_select() {
    await edit.insert(position_ins, text);  //代替文本,插入文本
    let pos = str_run.indexOf('%');
    if (pos !== -1) {
      pos += str_bas.length;
      let posins1 = new vscode.Position(line + 1, pos);
      let posins2 = new vscode.Position(line + 1, pos);
      editor.selections = [new vscode.Selection(posins1, posins2)];
    }
  }

  if (selec.length === 1 && (selec[0][2] + '').trim().length === 0) {
    add_select();
  } else {
    edit.insert(position_ins, text);  //代替文本,插入文本
  }

}