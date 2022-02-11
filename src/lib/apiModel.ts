import * as vscode from 'vscode';
import fs = require('fs');
import path = require('path');
import { Util } from '../Util';
import { Api } from './../lib/api';
import { Jsoncd } from './../com/jsonOutline';
import { outputChannel, configUrl } from './../lib/const';
import { fun_list } from './../autoregister/lists';
import { sockRunToken } from './../lib/sockRunToken';
import { MessageService } from './../lib/webSocket';
import { ChangeTargetSshServer } from './../lib/ChangeTargetSshServer';


export class apiModel {

  static r_open_file(data: any, run?: string) {

    if (fs.existsSync(data.file)) {

      let stat = fs.lstatSync(data.file);
      let uri = vscode.Uri.file(data.file);

      if (stat.isFile()) {

        if (data.hasOwnProperty('line')) {

          if (data.hasOwnProperty('KK')) {

            vscode.window.showTextDocument(uri).then(function (TextEditor) {

              let content = TextEditor.document.getText();
              let pos = content.indexOf(data['KK']);
              if (pos === -1) {
                return;
              }

              let list = content.substr(0, pos).split("\n");
              content = '';
              let line = list.length - 1;

              let line_t1 = list[list.length - 1].length;
              let line_t2 = line_t1 + data['KK'].length;

              const options = {
                selection: new vscode.Range(
                  new vscode.Position(line, line_t1),
                  new vscode.Position(line, line_t2)
                ),
                preview: false,
              };
              vscode.window.showTextDocument(TextEditor.document, options);
            });

          } else {
            const options = {
              // 选中第3行第9列到第3行第17列
              selection: new vscode.Range(
                new vscode.Position(data.line, 0),
                new vscode.Position(data.line, 0)
              ),
              // 是否预览，默认true，预览的意思是下次再打开文件是否会替换当前文件
              preview: false,
              // 显示在第二个编辑器
              // viewColumn: vscode.ViewColumn.Two
            };
            vscode.window.showTextDocument(uri, options);
          }

        } else {
          const options = {
            // selection: new vscode.Range(
            //   new vscode.Position(0, 0),
            //   new vscode.Position(0, 0)
            // ),
            preview: false,
          };
          vscode.window.showTextDocument(uri, options);
        }
      } else {
        vscode.commands.executeCommand('vscode.openFolder', uri);
      }
    }
  }



  static r_getText(data: any, old_data: any) {
    let document: vscode.TextDocument | null = vscode.window.activeTextEditor ?
      vscode.window.activeTextEditor.document : null;

    if (!document) {
      for (let index = 0; index < data.length; index++) {
        data[index]['con'] = '';
      }
    } else {

      for (let index = 0; index < data.length; index++) {
        const info = data[index];
        console.log(info);

        let Range_ins: vscode.Range = new vscode.Range(
          new vscode.Position(info.line, info.char),
          new vscode.Position(info.end_line, info.end_char)
        );
        data[index]['con'] = document.getText(Range_ins);
      }
    }
    sockRunToken.sendRunTokenApi(data, old_data);
  }


  static r_saveText(data: any, old_data: any) {
    Util.docSave().then(function () {
      sockRunToken.sendRunTokenApi({ msg: '保存完成！' }, old_data);
    });
  }


  static r_move_file(data: any, run?: string) {
    console.log(data);
    Util.move(data['path'], data['targetPath']);
  }



  static r_editSnippet(data: any, run?: string) {
    // let data = { 'value': 'fdsfsd', 'line': 3, 'chat': 3 };
    let editor = vscode.window.activeTextEditor;
    if (editor) {
      let insertPosition = new vscode.Position(data.line, data.chat);
      editor.insertSnippet(new vscode.SnippetString(data.value), insertPosition);
    }
  }



  static r_diff(data: any, run?: string) {
    let obj = { "opts": {} };
    data = Util.merge(true, obj, data);
    vscode.commands.executeCommand("vscode.diff",
      vscode.Uri.file(data.file1),
      vscode.Uri.file(data.file2), "Fix " + path.basename(data.file1) + "", data.opts)
  }



  static r_demo_edit(data: any, run?: string) {
    vscode.commands.executeCommand('extension.demo.edit', data);
  }



  static r_set_selections(data: any, run?: string) {
    let editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    let selec_ar: any[] = [];
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const val = data[key];
        let posins1 = new vscode.Position(val['start']['line'], val['start']['character']);
        let posins2 = new vscode.Position(val['end']['line'], val['end']['character']);
        selec_ar.push(new vscode.Selection(posins1, posins2));
      }
    }
    editor.selections = selec_ar;
  }



  static r_insert(data: any, run?: string) {
    let obj = { "key": 'insert', "line": 0, 'char': 0, 'con': '' };
    let uri = [Util.merge(true, obj, data)];
    vscode.commands.executeCommand('extension.demo.edit', uri);
  }



  static r_setJson(data: any, run?: string) {
    Jsoncd.json.setJson(data.json);
  }



  static r_outputChannel(data: any, run?: string) {
    let op: any = { show: 1, clear: 0, rest_focus: 1 };
    op = Util.merge(true, op, data);

    if (op.show) {
      let preserveFocus = op.rest_focus == 1 ? true : false;
      outputChannel.show(preserveFocus);
    }

    if (op.clear) {
      outputChannel.clear();
    }

    outputChannel.appendLine(op.val);
  }


  // run_terminal 的data内容说明
  // pwd: '',      // 当前路径
  // clear: 1,     // 清除之前内容
  // val: '',      // 要执行的命令
  // rest_focus: 0 // 焦点回到编辑器
  static r_run_shell(data: any, run?: string) {
    Util.run_terminal(data);
  }


  static r_list(data: any, run: string) {
    if (run === 'lists') {
      fun_list(data);

    } else if (run === 'ecs_lists') {
      fun_list(data, lists => {
        return lists;
      });
    }
  }



  static r_api(data: any) {
    data.p.file_dirs_s = 'VS-DIRS-SOURCE';
    data.p = Api.argsRun(data.p);

    this.run_aa(data);

    // http.post(data.u, Object.assign(data.p)).then(res => {
    //   Api.res(res, data);
    // });
  }


  static async run_aa(data: any) {
    var config = {
      "url": data.u,
      "method": "post",
      "data": data.p,
      "headers": { "Content-Type": "" },
    };

    config.headers['Content-Type'] = 'application/json';

    config.url = config.url + '';
    if (!config.data.file) {
      config.data.file = Util.getProjectPath();
    }

    config.data.languageId = vscode.window.activeTextEditor ?
      vscode.window.activeTextEditor.document.languageId :
      null;

    if (!config.data.jsondata) {
      config.data.jsondata = {};
    }

    if (!config.data.notGetJsonData) {
      config.data.jsondata = Util.merge(true, Util.getJsonData(), config.data.jsondata);
    }

    if (config.url != "/account/getSshAll" && ChangeTargetSshServer.lists) {
      if (!config.data.jsondata['ssh'] || config.data.jsondata['ssh'].length < 2) {
        ChangeTargetSshServer.getListCurrent('null');
        let back: any = await ChangeTargetSshServer.getListCurrent();
        config.data.jsondata['ssh'] = back.key;

      } else {
        ChangeTargetSshServer.setListCurrent(config.data.jsondata['ssh']);
      }
    }

    if (!config.url.startsWith('http:')) {
      config.url = configUrl + config.url;
    }

    MessageService.send(config);

  }












  static r_input(data: any) {

    if (!data.hasOwnProperty('list')) {
      data['list'] = [data];
    }

    let info = data['list'].shift();

    let input: any = {
      password: false,
      placeHolder: '',  // 在输入框中显示为占位符的可选字符串，以指导用户键入内容。
      ignoreFocusOut: true,  // 设置为true可以在焦点移到编辑器的另一部分或另一个窗口时使输入框保持打开状态。
      valueSelection: [],  // 
      value: '',
      prompt: '请输入目录：'
    };
    input = Util.merge(true, input, info);

    if (input.valueSelection.length < 1) {
      input.valueSelection = [input.value.length, input.value.length];
    }

    vscode.window.showInputBox({
      placeHolder: input.placeHolder,
      value: input.value,
      prompt: input.prompt,
      ignoreFocusOut: input.ignoreFocusOut,
      valueSelection: input.valueSelection,
      password: input.password
    }).then((name) => {

      data['value'] = name;
      if (info.hasOwnProperty('to->v')) {
        data = Util.str_to_obj(data, info['to->v'], name);
      }

      if (data.list.length > 0) {
        this.r_input(data);
      } else if (data.hasOwnProperty('run')) {
        Api.run(data);
      }
    });
  }

  static r_get_clipboard(data: any, old_data: any) {
    vscode.env.clipboard.readText().then((text) => {
      sockRunToken.sendRunTokenApi({ value: text }, old_data);
    });
  }

  static r_set_clipboard(data: any, old_data: any) {
    vscode.env.clipboard.writeText(data.value)
    sockRunToken.sendRunTokenApi({ 'msg': '设置成功' }, old_data);
  }


  static async r_run_ide_exec(data: any, old_data: any) {
    let obj = { "opts": {} };
    data = Util.merge(true, obj, data);
    Util.exec(data.bash, data.opts, (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.error(`执行的错误: ${error}`);
      }
      sockRunToken.sendRunTokenApi({ value: stdout, error: error, stderr: stderr }, old_data);
    });
  }

}
