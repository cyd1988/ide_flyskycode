import * as vscode from 'vscode';
import path = require('path');
import fs = require('fs');
import { Util } from '../Util';
import { sockRunToken } from './../lib/sockRunToken';


import {
    DocumentLinkProvider,
    TextDocument,
    ProviderResult,
    DocumentLink,
    Position,
    Range
} from "vscode";



class LinkProvider implements DocumentLinkProvider {
    public provideDocumentLinks(doc: TextDocument): ProviderResult<DocumentLink[]> {
        let documentLinks = [];
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


var select_word_global: any;

function getWordRegs(document: vscode.TextDocument, position: vscode.Position, run_name = '') {
    // let regs = [undefined, /[^'"]+/];
    let regs = [
        /[^\n]+/,
        /[^'"]+/,
        /[^ '"]+/,
        undefined
    ];
    let file: any = [];
    let line_tm: any = [];
    let line = 0;

    let select_word = Util.getSelecttextLineOne();

    if (select_word) {

        select_word = Util.str_replace(select_word);
        line_tm = Util.getFileLine(select_word);

        select_word = line_tm[0] + '';
        line = parseInt(line_tm[1] + '');

        file = Util.getWordFile(select_word, line_tm, run_name);

        if (file.length > 0) {
            select_word_global = { 'value': [line, file], time: (new Date()).getTime() };
            return [line, file];
        }
    }

    if (select_word_global) {
        let tmp = select_word_global;
        select_word_global = undefined;

        if ((new Date()).getTime() - tmp.time < 4000) {
            return [tmp.value[0], tmp.value[1]];
        }
    }

    for (let index = 0; index < regs.length; index++) {
        const reg = regs[index];
        let word: string = getWord(document, position, reg);

        if (word.length < 1) {
            continue;
        };
        ;
        word = Util.str_replace(word);
        line_tm = Util.getFileLine(word);
        word = line_tm[0] + '';
        line = parseInt(line_tm[1] + '');

        file = Util.getWordFile(word, line_tm, run_name);

        if (file.length > 0) {
            break;
        }
    }
    return [line, file];
}

function getWord(document: vscode.TextDocument, position: vscode.Position, reg?: RegExp | undefined) {

    let word = '';
    word = document.getText(document.getWordRangeAtPosition(position, reg));
    if (word.length > 160) {
        return '';
    }
    word = word.trim();
    return word;
}



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

    let tm = getWordRegs(document, position, 'provideHover');
    const file = tm[1];

    if (file.length > 0) {
        let html: string[] = [];
        file.forEach((val: string) => {
            let file_path = path.join(val[0], "");
            file_path = file_path.replace(/ /g, '%20');
            let name = path.basename(file_path);
            html.push(`[${name}](${file_path}) ${file_path}`);
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

/**
 * 查找文件定义的provider，匹配到了就return一个location，否则不做处理
 * 最终效果是，当按住Ctrl键时，如果return了一个location，字符串就会变成一个可以点击的链接，否则无任何效果
 * @param {*} document 
 * @param {*} position 
 * @param {*} token 
 */
function provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
    let tm = getWordRegs(document, position, 'provideDefinition');
    const line = tm[0];
    const file = tm[1];

    if (file.length > 0) {

        let file_path = path.join(file[0][0], "");
        if (file[0].length === 4) {

            return new vscode.Location(vscode.Uri.file(file_path),
                new vscode.Range(
                    new vscode.Position(file[0][1], file[0][2]),
                    new vscode.Position(file[0][1], file[0][3])
                )
            );
        } else {
            return new vscode.Location(vscode.Uri.file(file_path), new vscode.Position(line, 0));
        }
    }
    return;
}



let provideDefinitionAc: vscode.DefinitionProvider = {
    async provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {

        let word: string = getWord(document, position);
        let runToken = (new Date()).getTime();

        let data = {
            run: 'api',
            api: {
                u: "/envt/on_provideDefinition",
                p: {
                    'word': word,
                    'runToken': runToken,
                    'position': position,
                    'select_lines': Util.SELECT_LINES(),
                }
            }
        };

        let info: any = await sockRunToken.apiRun(data);

        if (info && info['provide'] && info['provide'].length > 0) {
            let one = info['provide'][0];
            return new vscode.Location(vscode.Uri.file(one['file']), new vscode.Position(one['line'], one['character']));
        }

        return;
    }
}




let provideHoverAc: vscode.HoverProvider = {
    async provideHover(document: vscode.TextDocument, position: any, token: any) {

        let word: string = getWord(document, position);

        let data = {
            run: 'api',
            api: {
                u: "/envt/on_provideHover",
                p: {
                    'word': word,
                    'runToken': sockRunToken.getToken(),
                    'position': position,
                    'select_lines': Util.SELECT_LINES(),
                }
            }
        };
        let info: any = await sockRunToken.apiRun(data);

        let html: string[] = [];

        if (info && info['hover']) {
            html = info['hover']
        }

        return new vscode.Hover(html);
    }
}




export function hover(context: any) {
    // 注册鼠标悬停提示
    // context.subscriptions.push(vscode.languages.registerHoverProvider('*', {
    //     provideHover
    // }));

    // 注册如何实现跳转到定义，第一个参数表示仅对json文件生效
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('*', {
        provideDefinition
    }));


    // context.subscriptions.push(vscode.languages.registerHoverProvider('*', provideHoverAc));
    // context.subscriptions.push(vscode.languages.registerDefinitionProvider('*', provideDefinitionAc));

    // context.subscriptions.push(vscode.languages.registerDocumentLinkProvider('*', new LinkProvider()));
}