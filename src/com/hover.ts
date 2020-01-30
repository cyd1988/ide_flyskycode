import * as vscode from 'vscode';
import path = require('path');
import fs = require('fs');
import { Util } from '../Util';
import {
    DocumentLinkProvider,
    TextDocument,
    ProviderResult,
    DocumentLink,
    workspace,
    Position,
    Range
} from "vscode";
// import * as utilo from '../utilo';


/**
 * 鼠标悬停提示，当鼠标停在package.json的dependencies或者devDependencies时，
 * 自动显示对应包的名称、版本号和许可协议
 * @param {*} document 
 * @param {*} position 
 * @param {*} token 
 */
function provideHover(document: vscode.TextDocument, position: any, token: any) {
    const fileName = document.fileName;
    const workDir = path.dirname(fileName);
    let word = document.getText(document.getWordRangeAtPosition(position));
    const word4 = document.getText(document.getWordRangeAtPosition(position, /[.\w+\/|<>:]+/));

    if (word4.length > 2) {
        word = word4;
    }

    if (word.length > 120) {
        return;
    }
    let file = '';
    if (!file && Util.isfile(workDir + '/' + word)) {
        file = workDir + '/' + word;
    }
    if (!file && Util.isfile(workDir + '/' + word + ".js")) {
        file = workDir + '/' + word + ".js";
    }
    if (!file && Util.isfile(workDir + '/' + word + ".ts")) {
        file = workDir + '/' + word + ".ts";
    }
    if (!file && Util.isfile(workDir + '/' + word + ".php")) {
        file = workDir + '/' + word + ".php";
    }


    if (file) {
        file = path.join(file, "");
        file = file.replace(/ /g, '%20');
        let name = path.basename(file);
        return new vscode.Hover(`[${name}](${file}) ${file}`);
    } else if (/\/package\.json$/.test(fileName)) {
        const json = document.getText();
        if (new RegExp(`"(dependencies|devDependencies)":\\s*?\\{[\\s\\S]*?${word.replace(/\//g, '\\/')}[\\s\\S]*?\\}`, 'gm').test(json)) {
            let destPath = `${workDir}/node_modules/${word.replace(/"/g, '')}/package.json`;
            if (fs.existsSync(destPath)) {
                const content = require(destPath);
                console.log('hover已生效');
                // hover内容支持markdown语法
                return new vscode.Hover(`* **名称**：${content.name}\n* **版本**：${content.version}\n* **许可协议**：${content.license}`);
            }
        }
    }
}

class LinkProvider implements DocumentLinkProvider {
    public provideDocumentLinks(doc: TextDocument): ProviderResult<DocumentLink[]> {
        // let documentLinks = [];
        // if (file != null) {
        //     let start = new Position(line.lineNumber, line.text.indexOf(item) + 1);
        //     let end = start.translate(0, item.length - 2);
        //     let documentlink = new DocumentLink(new Range(start, end), file.fileUri);
        //     documentLinks.push(documentlink);
        // };

        // return documentLinks;


        console.log(43433);
        let documentLinks = [];

        // let config = workspace.getConfiguration('laravel_goto_view');

        // if (config.quickJump) {
        //     let reg = new RegExp(config.regex, 'g');
        //     let linesCount = doc.lineCount <= config.maxLinesCount ? doc.lineCount : config.maxLinesCount
        //     let index = 0;
        //     while (index < linesCount) {
        //         let line = doc.lineAt(index);
        //         let result = line.text.match(reg);

        //         if (result !== null) {
        //             for (let item of result) {
        //                 let file = utilo.getFilePath(item, doc);

        //                 if (file !== null) {
        //                     let start = new Position(line.lineNumber, line.text.indexOf(item) + 1);
        //                     let end = start.translate(0, item.length - 2);
        //                     let documentlink = new DocumentLink(new Range(start, end), file.fileUri);
        //                     documentLinks.push(documentlink);
        //                 };
        //             }
        //         }

        //         index++;
        //     }
        // }

        // let start = new Position(line.lineNumber, line.text.indexOf(item) + 1);
        // let end = start.translate(0, item.length - 2);
        // let documentlink = new DocumentLink(new Range(start, end), file.fileUri);
        // documentLinks.push(documentlink);

        if (1) {
            let destPath = '/Applications/Visual Studio Code.app/Contents/Resources/app/extensions/vscode-plugin-flyskycode/src/com/hover.ts';
            let uris = vscode.Uri.file(destPath);
            let start = new Position(1, 1);
            let end = new Position(2, 1);
            let documentlink = new DocumentLink(new Range(start, end), uris);
            documentLinks.push(documentlink);
        }

        return documentLinks;
    }
}

export function hover(context: any) {
    // 注册鼠标悬停提示
    context.subscriptions.push(vscode.languages.registerHoverProvider('*', {
        provideHover
    }));
    // context.subscriptions.push(vscode.languages.registerDocumentLinkProvider('*', new LinkProvider()));
}