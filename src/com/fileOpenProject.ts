// const vscode = require('vscode');
const util = require('../Util');
const fs = require('fs');

import * as  vscode from 'vscode';



// promisses
function onResolve(selected: string, forceNewWindow = false) {
    vscode.commands.executeCommand("setContext", "inProjectManagerList", false);
    if (!selected) {
        return;
    }
    if (fs.existsSync(selected)) {
        let projectPath: string = selected;
        const uri = vscode.Uri.file(projectPath);
        vscode.commands.executeCommand("vscode.openFolder", uri, forceNewWindow)
            .then(
                value => ({}), // done
                value => vscode.window.showInformationMessage("Could not open the project!"));
    }
}


function openProject(path: string, forceNewWindow = true) {
    var stat = fs.lstatSync(path);
    if (stat.isFile()) {
        path = util.getDirname(path);
    }
    onResolve(path, forceNewWindow);
}

function input_dir(forceNewWindow = true) {
    vscode.window.showInputBox({
        placeHolder: '',
        value: '',
        prompt: '请输入目录：',
        password: false
    }).then((name) => {
        if (fs.existsSync(name)) {
            openProject(name + '',forceNewWindow);
        }
    });
}


export function fileOpenProject(context: vscode.ExtensionContext) {


    context.subscriptions.push(vscode.commands.registerCommand('extension.demo.openProject', function (uri) {
        if (uri) {
            openProject(uri.fsPath);
        } else {
            input_dir();
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('extension.demo.openProject2', function (uri) {
        if (uri) {
            openProject(uri.fsPath);
        } else {
            input_dir(false);
        }
    }));


}