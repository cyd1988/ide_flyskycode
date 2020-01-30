import * as vscode from 'vscode';
import { Util } from '../Util';
import { service as http } from '../lib/httpIndex';


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
      console.log(range);

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
        range = new vscode.Range(posins, range.end);
      }
    }
    console.log(range);
    edit.delete(range);
  }
}

async function ctrls(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, file: string) {
  await textEditor.document.save();
  let param = { "type": "websock", "run": "refresh_page", "file": file };
  http.post('/refresh_page', Object.assign(param));
}


export function main(
  textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any) {

  const projectPath: string = Util.getFilePath();
  if (!projectPath) {
    return;
  }
  const data = Util.getJsonData();
  if (args['ty'] === 'backspace') {
    backspace(textEditor, edit);
  } else if (args['ty'] === 'ctrls') {
    ctrls(textEditor, edit, projectPath);
  }
}