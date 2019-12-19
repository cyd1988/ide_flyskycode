import * as vscode from 'vscode';

import {Util}  from '../Util';
import fs = require('fs');
import {Config}  from '../configurations/config';
const Configs: any = Config.configJsonContent();


export function fileOpen(context:vscode.ExtensionContext) {

    
    context.subscriptions.push(vscode.commands.registerCommand('extension.demo.fileOpen', function(uri) {

        const projectPath = Util.getFilePath();
        if (!projectPath) {
            return;
        }
        
        if (uri === "af4") {
            let destPaths = Configs['afNum'][uri].files;

            vscode.window.showQuickPick(destPaths.map((w:string) => {
                return { "label": Util.getProjectName(w), "path": w };
            }), {
                // canPickMany: true, // 一个可选标志，使选择器接受多个选择，如果为true，则结果为选择数组。
                ignoreFocusOut: true, // 设置为true可以在焦点移到编辑器的另一部分或另一个窗口时保持选择器处于打开状态。
                matchOnDescription: true, // 筛选标志时包含描述的可选标志。
                matchOnDetail: true, // 一个可选标志，用于在筛选选项时包括详细信息
                placeHolder: '选择要打开的文件？', // 在输入框中显示为占位符的可选字符串，以指导用户选择内容。
                onDidSelectItem: function(item) {
                    // console.log('aaa ', item);
                }
            }).then((value: any )=> {
                if (fs.existsSync(value.path)) {
                    let uri = vscode.Uri.file(value.path);
                    vscode.commands.executeCommand('vscode.openFolder', uri);
                }
            });

        } else {
            let destPath = Configs.afNum[uri].file;
            if (fs.existsSync(destPath)) {
                let uri = vscode.Uri.file(destPath);
                vscode.commands.executeCommand('vscode.openFolder', uri);
            }
        }

    }));
}