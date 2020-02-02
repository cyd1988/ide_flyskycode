import fs = require('fs');
import * as vscode from 'vscode';
import { Util } from '../Util';
import { service as http } from '../lib/httpIndex';
import { outputChannel, AnyObj } from './../lib/const';

const exec = require('child_process').exec;

function openAutoFn() {
  // 工程目录一定要提前获取，因为创建了webview之后 activeTextEditor
  // 会不准确
  const projectPath = Util.getFilePath();
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
      function (error: string | null, stdout: any, stderr: any) {

        function openFile(file_str: string) {
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
}

function openAutoCopy() {
  let projectPath = Util.getFilePath();
  if (!projectPath) {
    return;
  }

  exec(
    'printf "' + projectPath + '" | pbcopy',
    function (error: string | null, stdout: any, stderr: any) {
      if (error !== null) {
        console.log('exec error: ' + error);
      } else {
        console.log('复制完成 ', stdout);
      }
    });
}


export function main(args: any) {
  // 获取当前编辑器对象
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return false;
  }

  const data:any = Util.getJsonData();
  let con: string = Util.getSelecttextLine(editor);
  con = con.trim();

  let param:AnyObj = {"con": con};
  if(data.mysql && data.mysql.dbname){
    param.dbname = data.mysql.dbname;
  }

  http.post('/account/runmysql', Object.assign(param)).then(res => {
    if( res.status+'' === 'success'){
      outputChannel.show();
      outputChannel.clear();
      outputChannel.appendLine(res.data.con);
    }else{
      Util.showError(res.status+'');
      console.log( res );
    }
  });

  return;


  if (args.ty === "openAuto") {
    openAutoFn();
  } else if (args.ty === "openAutoCopy") {
    openAutoCopy();
  }
}