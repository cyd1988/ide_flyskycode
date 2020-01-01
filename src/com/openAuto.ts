import fs = require('fs');
import * as vscode from 'vscode';
import {Util} from './../Util';

const exec = require('child_process').exec;


export function openAuto(context: any) {
  // 注册命令，可以给命令配置快捷键或者右键菜单
  // 回调函数参数uri：当通过资源管理器右键执行命令时会自动把所选资源URI带过来，当通过编辑器中菜单执行命令时，会将当前打开的文档URI传过来
  context.subscriptions.push(
      vscode.commands.registerCommand('extension.demo.openAuto', function(uri) {
        // 工程目录一定要提前获取，因为创建了webview之后 activeTextEditor
        // 会不准确
        const projectPath = Util.getFilePath(uri);
        if (!projectPath) {
          return;
        }

        // 获取当前编辑器对象
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          return false;
        }

        const data = Util.getJsonData();
        let files: string = Util.getSelecttextLine(editor);
        files = files.trim();
        let files_strs: string = files;

        files = Util.getStringPath(files, projectPath, data);

        if (files.length > 3) {
          let uri = vscode.Uri.file(files);
          vscode.commands.executeCommand('vscode.openFolder', uri);
        } else {
          // 打开剪贴板的文件
          exec(
              'pbpaste',
              function(error: string|null, stdout: any, stderr: any) {

                function openFile(file_str:string){
                  if (fs.existsSync(file_str)) {
                    let stat = fs.lstatSync(file_str);
                    if (stat.isFile()) {
                      let uri = vscode.Uri.file(file_str);
                      vscode.commands.executeCommand('vscode.openFolder', uri);
                    }
                  } 
                }
      
                if (error !== null) {
                  console.log('exec error: ' + error);
                } else {
                  if (fs.existsSync(stdout)) {
                    openFile(stdout);
                  } else if (files_strs.substr(0, 1) === '/') {
                    if (Util.createFileDir(files_strs)) {
                      openFile(files_strs);
                    }
                  }
                }
              });
        }
      }));

  context.subscriptions.push(vscode.commands.registerCommand(
      'extension.demo.openAutoCopy', function(uri) {
        let projectPath = Util.getFilePath(uri);
        if (!projectPath) {
          return;
        }

        exec(
            'printf "' + projectPath + '" | pbcopy',
            function(error: string|null, stdout: any, stderr: any) {
              if (error !== null) {
                console.log('exec error: ' + error);
              } else {
                console.log('复制完成 ', stdout);
              }
            });
      }));
}