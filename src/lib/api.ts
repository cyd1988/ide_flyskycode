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
    static res(res: any, args?: any) {
        let that = this;
        function ruPost() {
            res.data = Api.argsRun(res.data);
            if (res.data.hasOwnProperty('run')) {
                that.run(res.data);
            }
        }
        if (res.data.hasOwnProperty('save')) {
            Util.docSave().then(ruPost);
        } else {
            ruPost();
        }
    }

    static argsRun(args: any) {
        for (const key in args) {
            if (args.hasOwnProperty(key)) {
                const val = args[key];
                // VS-SELECT-LINE-ONE
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
                } else if (val === 'VS-DIRS-SOURCE') {
                    args[key] = Util.getWorkspaceFolders(1);
                    if (args[key] === '') {
                        Util.showError('获取不到文件路径！');
                    }
                } else if (val === 'VS-SELECT-LINE-') {  // VS-SELECT-LINE-5
                    let len = parseInt(val.replace('VS-SELECT-LINE-', ''));
                    args[key] = Util.SELECT_LINES(len);
                } else if (val === 'VS-SELECT-LINES') {
                    args[key] = Util.SELECT_LINES();
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

        if (data.hasOwnProperty('run_sleep') && data['run_sleep'] > 0) {
            let tm = data['run_sleep'];
            data['run_sleep'] = 0;            
            setTimeout(function(){
                data = Api.argsRun(data);
                Api.run(data);
            }, tm);
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
        } else if (data.run === 'insert') {
            this.r_insert(data[data['run']]);
        } else if (data.run === 'set_selections') {
            this.r_set_selections(data[data['run']]);
        } else if (data.run === 'demo_edit') {
            this.r_demo_edit(data[data['run']]);
        } else {
            console.log('没找到方法：api.run.data', data);
        }

        // 执行子 run 方法
        if( data.run !== 'input' ){
            let new_data = data[data['run']];
            if (new_data.hasOwnProperty('run')) {
                this.run(new_data);
            }
        }
    }
    static r_demo_edit(data: any, run?: string) {
    console.log('r_demo_edit', data );
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