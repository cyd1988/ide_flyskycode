import * as vscode from 'vscode';
import { Util } from '../Util';
import { outputChannel, AnyObj } from './../lib/const';
import { service as http } from '../lib/httpIndex';

function terminal() {

  const projectPath = Util.getFilePath();
  if (!projectPath) {
    return;
  }

  // 获取当前编辑器对象
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return false;
  }

  let sels = editor.selections;
  let bashs = '';
  sels.forEach(selection => {
    if (!selection.isEmpty) {
      bashs += editor.document.getText(
        new vscode.Range(selection.start, selection.end));
    }
  });

  if (bashs === '') {
    let selectionStartOffset = editor.document.offsetAt(sels[0].start);
    bashs =
      editor.document
        .lineAt(editor.document.positionAt(selectionStartOffset).line)
        .text;
  }

  Util.run_terminal(bashs, Util.getDirname(projectPath));

}

export function main(args: any) {
  if (args.ty === 'runBash') {
    terminal();
  } else if (args.ty === 'runBashSsh') {
    const data: any = Util.getJsonData();
    let con: string = Util.getSelecttextLine().trim();
    if (data.ssh || con.indexOf('::2:') !== -1) {

      let param: AnyObj = { "con": con, "ssh": data.ssh };
      http.post('/account/run_bash_ssh', Object.assign(param)).then(res => {
        console.log(res);
        if (res.status + '' === 'success') {
          let bash = 'bash "'+res.data.sh_file+'"';
          Util.run_terminal(bash);
        } else {
          Util.showError(res.status + '');
          console.log(res);
        }
      });
    }
  }

}