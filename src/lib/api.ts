import * as vscode from 'vscode';
import { fun_list } from './../autoregister/lists';



export class Api {
    static ROOT_DIR: string | null;



    static resa(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, res: any, args: any) {
        console.log(res);
        console.log(args);

        let position_ins: vscode.Position = new vscode.Position(1, 0);
        edit.insert(position_ins, 'text');  //代替文本,插入文本

    }

    static res(res: any, args: any) {
        if(res.data.run === 'lists'){
            fun_list(res.data.list);
        }
        console.log( args );



    }

}