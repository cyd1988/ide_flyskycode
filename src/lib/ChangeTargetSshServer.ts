// TextDocument：表示文本文档，例如源文件 可以自行查看 api 哈
import { window, StatusBarItem, StatusBarAlignment, TextDocument } from 'vscode';
import * as vscode from 'vscode';

import { sockRunToken } from './sockRunToken';



export class ChangeTargetSshServer {
    static statusBar: StatusBarItem;
    static targetId: string;
    static lists: any;


    public static async init() {
        if(!ChangeTargetSshServer.statusBar){
            ChangeTargetSshServer.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
            ChangeTargetSshServer.statusBar.command = 'extension.demo.changeTargetSshServer';
            ChangeTargetSshServer.statusBar.tooltip = '选择要使用的SSH账号！';
            ChangeTargetSshServer.statusBar.color = '#00AA00';
        }

        await ChangeTargetSshServer.setLanguageText();
        ChangeTargetSshServer.statusBar.show();
    }


    public static async changeTargetLanguage() {
        let lists = await ChangeTargetSshServer.getListSsh();
        let res: any = await vscode.window.showQuickPick(lists.map((item: any) => item.value_s), {
            placeHolder: '选择要使用的账号！'
        });

        if (res) {
            ChangeTargetSshServer.targetId = res.split('-')[0];
            ChangeTargetSshServer.setLanguageText();
        }
    }


    static async setLanguageText() {
        await ChangeTargetSshServer.getListSsh();
        let info = await ChangeTargetSshServer.getListCurrent();
        ChangeTargetSshServer.statusBar.text = '$(project) ' + info.value;
    }


    static async getListSsh() {
        if (!ChangeTargetSshServer.lists) {
            let data = {
                run: 'api',
                api: {
                    u: "/account/getSshAll",
                    p: {
                        'runToken': sockRunToken.getToken(),
                        'position': 'position',
                    }
                }
            };
            let tmp = await sockRunToken.apiRun(data);
            ChangeTargetSshServer.lists = tmp['list_ssh'];
        }

        return ChangeTargetSshServer.lists;
    }


    static async getListCurrent(keys?:string) {
        let lists = await ChangeTargetSshServer.getListSsh();
        if(keys){

            let info = await ChangeTargetSshServer.getListCurrent();
            if(keys=='null'){
                ChangeTargetSshServer.statusBar.text = '$(project) ' + info.value;
            }else{

                for (let index = 0; index < lists.length; index++) {
                    const element = lists[index];
                    if (element.key == keys) {
                        keys = element.value_tm;
                        break;
                    }
                }

                ChangeTargetSshServer.statusBar.text = '$(project) ' + info.value+'   '+keys;
            }

        }else{

            let info = lists[0];
            for (let index = 0; index < lists.length; index++) {
                const element = lists[index];
                if (element.id == ChangeTargetSshServer.targetId) {
                    info = element;
                    break;
                }
            }
            return info;
        }
    }

}