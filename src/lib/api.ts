import * as vscode from 'vscode';
import { fun_list } from './../autoregister/lists';
import { Util } from '../Util';
import { service as http } from './../lib/httpIndex';
import fs = require('fs');
import { outputChannel } from './../lib/const';
import { Jsoncd } from './../com/jsonOutline';


export class Api {
    static ROOT_DIR: string | null;
    // static resa(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, res: any, args: any) {
    //     let position_ins: vscode.Position = new vscode.Position(1, 0);
    //     edit.insert(position_ins, 'text');  //代替文本,插入文本
    // }
    static res(res: any, args: any) {
        if (res.data.hasOwnProperty('run')) {
            this.run(res.data);
        }
    }

    static argsRun(args: any) {
        for (const key in args) {
            if (args.hasOwnProperty(key)) {
                const val = args[key];
                if (val === 'VS-LINE') {
                    args[key] = Util.getSelecttextLine().trim();
                } else if (val === 'VS-FILE_DIR') {
                    args[key] = Util.getDirname(Util.getProjectPath()) + '/';
                    if (args[key] === '/') {
                        Util.showError('获取不到文件目录！');
                    }
                } else if (val === 'VS-FILE_PATH') {
                    args[key] = Util.getProjectPath();
                    if (args[key] === '') {
                        Util.showError('获取不到文件路径！');
                    }
                } else if (val === 'VS-DIRS') {
                    args[key] = Util.getWorkspaceFolders();
                    if (args[key] === '') {
                        Util.showError('获取不到文件路径！');
                    }
                }
            }
        }
        return args;
    }






    static run(data: any) {
        if (!data.hasOwnProperty('run') || !data.hasOwnProperty(data['run'])) {
            console.log('data', data);
            Util.showError('属性不存在-' + data.string);
            return;
        }
        if (data['run'] === 'api') {
            this.r_api(data[data['run']]);
        } else if (data.run === 'lists' || data.run === 'ecs_lists') {
            this.r_list(data[data['run']], data['run']);
        } else if (data.run === 'input') {
            this.r_input(data[data['run']]);
        } else if (data.run === 'open_file') {
            this.r_open_file(data[data['run']]);
        } else if (data.run === 'run_shell') {
            this.r_run_shell(data[data['run']]);
        } else if (data.run === 'outputChannel') {
            this.r_outputChannel(data[data['run']]);
        } else if (data.run === 'setJson') {
            this.r_setJson(data[data['run']]);
        } else {
            console.log('没找到方法：api.run.data', data);
        }
    }

    static r_setJson(data: any, run?: string) {
        Jsoncd.json.setJson(data.json);
    }

    static r_outputChannel(data: any, run?: string) {
        let op: any = { show: 1, clear: 0 };
        op = Util.merge(true, op, data);
        if (op.show) {
            outputChannel.show();
        }
        if (op.clear) {
            outputChannel.clear();
        }
        outputChannel.appendLine(op.val);
    }


    static r_run_shell(data: any, run?: string) {
        Util.run_terminal(data['val']);
    }

    static r_open_file(data: any, run?: string) {
        if (fs.existsSync(data.file)) {
            let stat = fs.lstatSync(data.file);
            if (stat.isFile()) {
                let uri = vscode.Uri.file(data.file);
                vscode.commands.executeCommand('vscode.openFolder', uri);
            }
        }
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
        data.p = Api.argsRun(data.p);
        http.post(data.u, Object.assign(data.p)).then(res => {
            Api.res(res, data);
        });
    }

    static r_input(data: any) {
        let input: any = { password: false, placeHolder: '', value: '', prompt: '请输入目录：' };
        for (const key in input) {
            if (input.hasOwnProperty(key) && data.hasOwnProperty(key)) {
                input[key] = data[key];
            }
        }
        vscode.window.showInputBox({
            placeHolder: input.placeHolder,
            value: input.value,
            prompt: input.prompt,
            password: input.password
        }).then((name) => {
            if (data.hasOwnProperty('to->v')) {
                data = Util.str_to_obj(data, data['to->v'], name);
            }
            if (data.hasOwnProperty('run')) {
                Api.run(data);
            }
        });
    }






}