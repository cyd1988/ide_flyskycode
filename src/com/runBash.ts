import * as vscode from 'vscode';
import {Util} from './../Util';


export function runBash(context: any) {
  // 注册命令，可以给命令配置快捷键或者右键菜单
  // 回调函数参数uri：当通过资源管理器右键执行命令时会自动把所选资源URI带过来，当通过编辑器中菜单执行命令时，会将当前打开的文档URI传过来
  context.subscriptions.push(
      vscode.commands.registerCommand('extension.demo.runBash', function(uri) {
        const projectPath = Util.getFilePath(uri);
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

        let text = 'cd "' + Util.getDirname(projectPath) + '"' +
            '\n';
        text += '\n\n\n';
        text += 'clear' +
            '\n';
        text += bashs + '\n';

        vscode.commands
            .executeCommand('workbench.action.terminal.toggleTerminal')
            .then(sucess => {
              vscode.commands.executeCommand(
                  'workbench.action.terminal.clear');  // 清除控制台
              vscode.commands.executeCommand(
                  'workbench.action.terminal.sendSequence', {'text': text});
            });
      }));


  context.subscriptions.push(vscode.commands.registerCommand(
      'extension.demo.runBashSsh', function(uri) {
        const projectPath = Util.getFilePath(uri);
        if (!projectPath) {
          return;
        }

        let json_data = Util.getJsonData();

        console.log(json_data);




        // if (bashs == '') {
        //     let selectionStartOffset =
        //     editor.document.offsetAt(sels[0].start); bashs =
        //     editor.document.lineAt(editor.document.positionAt(selectionStartOffset).line).text;
        // }

        // let text = 'cd "' + Util.getDirname(projectPath) + '"' + "\n";
        // text += "\n\n\n";
        // text += 'clear' + "\n";
        // text += bashs + "\n";
        // console.log(text);

        // vscode.commands.executeCommand('workbench.action.terminal.toggleTerminal').
        // then(sucess => {
        //     vscode.commands.executeCommand('workbench.action.terminal.clear');
        //     // 清除控制台
        //     vscode.commands.executeCommand('workbench.action.terminal.sendSequence',
        //     { "text": text });
        // });
      }));
}