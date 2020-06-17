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
                let val = args[key] + '';
                if (val === 'VS-LINE') {
                    args[key] = Util.getSelecttextLine().trim();
                } else if (val === 'VS-SELECT-LINE-ONE') {
                    args[key] = Util.getSelecttextLineOne().trim();
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
                } else if (val.substr(0, 15) === 'VS-SELECT-LINE-') {  // VS-SELECT-LINE-5
                    let len = parseInt(val.replace('VS-SELECT-LINE-', ''));
                    args[key] = Util.SELECT_LINES(len);
                } else if (val === 'VS-SELECT-LINES') {
                    args[key] = Util.SELECT_LINES();
                } else if (val === 'VS-LANGUAGE_ID') {
                    args[key] = Util.getLanguageId();
                } else if (val === 'VS-SELECTED_TEXT') {
                    args[key] = Util.getSelectedText();
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
            setTimeout(function () {
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
        } else if (data.run === 'diff') {
            this.r_diff(data[data['run']]);
        } else if (data.run === 'editSnippet') {
            this.r_editSnippet(data[data['run']]);
        } else if (data.run === 'move_file') {
            this.r_move_file(data[data['run']]);
        } else {
            console.log('没找到方法：api.run.data', data);
        }

        // 执行子 run 方法
        if (data.run !== 'input') {
            let new_data = data[data['run']];
            if (new_data.hasOwnProperty('run')) {
                this.run(new_data);
            }
        }
    }

    static r_move_file(data: any, run?: string) {
        console.log( data );
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

        // vscode.commands.executeCommand("vscode.diff", 
        // vscode.Uri.file(backupFilePath), 
        // vscode.Uri.file(file), "Fix " + path.basename(file) + "", opts)

        // vscode.commands.executeCommand('extension.demo.edit', data);
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

                if (data.hasOwnProperty('line')) {
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
                } else {
                    vscode.commands.executeCommand('vscode.openFolder', uri);
                }
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
        data.p.file_dirs_s = 'VS-DIRS-SOURCE';
        data.p = Api.argsRun(data.p);
        http.post(data.u, Object.assign(data.p)).then(res => {
            Api.res(res, data);
        });
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

        if(input.valueSelection.length < 1){
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
                Api.r_input(data);

            } else if (data.hasOwnProperty('run')) {
                Api.run(data);
            }
        });


    }






}