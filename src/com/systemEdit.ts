import * as vscode from 'vscode';

import {Config} from '../configurations/config';
import {Util} from '../Util';

var util = require('util');

let file = Util.DIR() + '/src/debug_print.json';
const debug_print: any = Config.loadConfig(file);

function backspace(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
  let del_leng;
  let text;
  let range;
  let posins: vscode.Position;
  let range_ins: vscode.Range;
  let doc: vscode.TextDocument = textEditor.document;
  for (let index = textEditor.selections.length - 1; index >= 0; index--) {
    range = textEditor.selections[index];

    if (range.start.character === range.end.character &&
        range.start.line === range.end.line) {
      if (range.start.character > 0) {
        posins = new vscode.Position(range.start.line, 0);
        range_ins = new vscode.Range(posins, range.start);
        text = doc.getText(range_ins);

        let new_str = '';
        for (let index = text.length - 1; index >= 0; index--) {
          let element = text[index];
          if (element !== ' ' && element !== '\t') {
            break;
          }
          new_str = element + new_str;
        }

        if (range.start.line > 0 && new_str === text) {
          posins = doc.lineAt(range.start.line - 1).range.end;
          posins = new vscode.Position(posins.line, posins.character);

        } else {
          del_leng = new_str.length;
          if (del_leng === 0) {
            del_leng = 1;
          }
          posins = new vscode.Position(
              range.start.line, range.start.character - del_leng);
        }

        range = new vscode.Range(posins, range.end);

      } else if (range.start.line > 0) {
        posins = doc.lineAt(range.start.line - 1).range.end;
        posins = new vscode.Position(posins.line, posins.character - 1);
        range = new vscode.Range(posins, range.end);
      }
    }
    edit.delete(range);
  }
}



export function systemEdit(
    context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) {
  // context.subscriptions.push(vscode.commands.registerCommand(
  context.subscriptions.push(vscode.commands.registerTextEditorCommand(
      'extension.demo.systemEdit',
      function(
          textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, args) {
        const projectPath: string = Util.getFilePath();
        if (!projectPath) {
          return;
        }
        const data = Util.getJsonData();
        if (args['ty'] === 'backspace') {
          backspace(textEditor, edit);
        }
      }));
}