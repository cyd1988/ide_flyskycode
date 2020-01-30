import * as vscode from 'vscode';
import { Util } from '../Util';

export function main(args: any) {

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



      // // 文件追加
      // let pre_str = 'source /Users/chenyudong/.zshrc\n';
      // pre_str = 'source /Users/chenyudong/.bash_profile\n';
      // pre_str += 'shopt -s  expand_aliases\n';
      // pre_str += 'dfdsfsdfdsfd\n';

      // let file_name = '/Users/webS/www/mynotes/web/test/tmp.sh';

      // console.log( 'destPath' );

      // var w_data = new Buffer(pre_str);
      // fs.writeFile(file_name, w_data, {flag: 'w'}, function(err) {
      //   if (err) {
      //     console.error(err);
      //   } else {
      //     console.log('写入成功');
      //   }
      // });
      // return;
}