import * as vscode from 'vscode';
import { Util } from '../Util';
import { MessageService } from './../lib/webSocket';
import { apiModel } from './../lib/apiModel';


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




    static run(data: any, old_data: any = {}) {

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
            apiModel.r_api(data[data['run']]);

        } else if (data.run === 'lists' || data.run === 'ecs_lists') {
            apiModel.r_list(data[data['run']], data['run']);

        } else if (data.run === 'input') {
            apiModel.r_input(data[data['run']]);

        } else if (data.run === 'open_file') {
            apiModel.r_open_file(data[data['run']]);

        } else if (data.run === 'run_shell') {
            apiModel.r_run_shell(data[data['run']]);

        } else if (data.run === 'outputChannel') {
            apiModel.r_outputChannel(data[data['run']]);

        } else if (data.run === 'setJson') {
            apiModel.r_setJson(data[data['run']]);

        } else if (data.run === 'insert') {
            apiModel.r_insert(data[data['run']]);

        } else if (data.run === 'set_selections') {
            apiModel.r_set_selections(data[data['run']]);

        } else if (data.run === 'demo_edit') {
            apiModel.r_demo_edit(data[data['run']]);

        } else if (data.run === 'diff') {
            apiModel.r_diff(data[data['run']]);

        } else if (data.run === 'editSnippet') {
            apiModel.r_editSnippet(data[data['run']]);

        } else if (data.run === 'move_file') {
            apiModel.r_move_file(data[data['run']]);

        } else if (data.run === 'getText') {
            apiModel.r_getText(data[data['run']], data);

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








}