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
    let word: string = getWord(document, position);
    let tm = Util.getFileLine(word);
    word = tm[0] + '';
    let file = Util.getWordFile(word);

    if (file.length > 0) {
        let html: string[] = [];
        file.forEach(val => {
            val = path.join(val, "");
            val = val.replace(/ /g, '%20');
            let name = path.basename(val);
            html.push(`[${name}](${val}) ${val}`);
        });
        return new vscode.Hover(html);
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


        // console.log(43433);
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

function getWord(document: vscode.TextDocument, position: vscode.Position) {
    let word = document.getText(document.getWordRangeAtPosition(position));
    // const word4 = document.getText(document.getWordRangeAtPosition(position, /[.\w+\/|<>:_-]+/));
    const word4 = document.getText(document.getWordRangeAtPosition(position, /[^ '"]+/));

    if (word4.length > 2) {
        word = word4;
    }
    if (word.length > 120) {
        return '';
    }
    word = word.trim();
    return word;
}

/**
 * 查找文件定义的provider，匹配到了就return一个location，否则不做处理
 * 最终效果是，当按住Ctrl键时，如果return了一个location，字符串就会变成一个可以点击的链接，否则无任何效果
 * @param {*} document 
 * @param {*} position 
 * @param {*} token 
 */
function provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
    let word: string = getWord(document, position);
    let tm = Util.getFileLine(word);
    word = tm[0] + '';
    let line = parseInt(tm[1] + '');
    let file = Util.getWordFile(word);
    if (file.length > 0) {
        let file_name = path.join(file[0], "");
        // file = file.replace(/ /g, '%20');
        // let name = path.basename(file);
        // new vscode.Position(0, 0) 表示跳转到某个文件的第一行第一列
        return new vscode.Location(vscode.Uri.file(file_name), new vscode.Position(line, 0));
    }
    return;

    // const line = document.lineAt(position);
    // const projectPath = Util.getProjectPathP(document);
    // console.log('fileName: ' + fileName); // 当前文件完整路径
    // console.log('workDir: ' + workDir); // 当前文件所在目录
    // console.log('word: ' + word); // 当前光标所在单词
    // console.log('line: ' + line.text); // 当前光标所在行
    // console.log('projectPath: ' + projectPath); // 当前工程目录
    // // 只处理package.json文件
    // if (/\/package\.json$/.test(fileName)) {
    //     console.log(word, line.text);
    //     const json = document.getText();
    //     if (new RegExp(`"(dependencies|devDependencies)":\\s*?\\{[\\s\\S]*?${word.replace(/\//g, '\\/')}[\\s\\S]*?\\}`, 'gm').test(json)) {
    //         let destPath = `${workDir}/node_modules/${word.replace(/"/g, '')}/package.json`;
    //         if (fs.existsSync(destPath)) {
    //             // new vscode.Position(0, 0) 表示跳转到某个文件的第一行第一列
    //             return new vscode.Location(vscode.Uri.file(destPath), new vscode.Position(0, 0));
    //         }
    //     }
    // }
}

export function hover(context: any) {
    // // 注册鼠标悬停提示
    context.subscriptions.push(vscode.languages.registerHoverProvider('*', {
        provideHover
    }));

    // 注册如何实现跳转到定义，第一个参数表示仅对json文件生效
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('*', {
        provideDefinition
    }));

    // context.subscriptions.push(vscode.languages.registerDocumentLinkProvider('*', new LinkProvider()));
}