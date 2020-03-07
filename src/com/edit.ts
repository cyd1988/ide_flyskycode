// const vscode = require('vscode');
const util = require('../util');
const fs = require('fs');

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
            }
        }
    }


    // /**
    //  * Replace a certain text region with a new value.
    //  * You can use \r\n or \n in `value` and they will be normalized to the current [document](#TextDocument).
    //  *
    //  * @param location The range this operation should remove.
    //  * @param value The new text this operation should insert after removing `location`.
    //  */
    // replace(location: Position | Range | Selection, value: string): void;

    // /**
    //  * Delete a certain text region.
    //  *
    //  * @param location The range this operation should remove.
    //  */
    // delete (location: Range | Selection): void;


}



export function editauto(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerTextEditorCommand(
            'extension.demo.edit',
            demoEdie)
    );
}