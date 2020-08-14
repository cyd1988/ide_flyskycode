// const vscode = require('vscode');

import * as  vscode from 'vscode';
import { Api } from './../lib/api';


async function demoEdie(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, args:any) {
    // await edit.insert(position_ins, text);  //代替文本,插入文本

    for (const key in args) {
        if (args.hasOwnProperty(key)) {
            const info = args[key];
            if (info.key === 'insert') {
                if (info.hasOwnProperty('run')) {
                    let position_ins: vscode.Position = new vscode.Position(info.line, info.char);
                    await edit.insert(position_ins, info.con);
                    Api.run(info);
                } else {
                    let position_ins: vscode.Position = new vscode.Position(info.line, info.char);
                    edit.insert(position_ins, info.con);
                }
            }else if(info.key === 'edit'){
                let position_ins: vscode.Position = new vscode.Position(info.line, info.char);
                let position_ins_end: vscode.Position = new vscode.Position(info.end.line, info.end.char);
                let Range_ins: vscode.Range = new vscode.Range(position_ins, position_ins_end);
                edit.replace(Range_ins, info.con);
            }
        }
    }



}



export function editauto(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerTextEditorCommand(
            'extension.demo.edit',
            demoEdie)
    );
}