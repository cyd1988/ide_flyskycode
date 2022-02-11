// TextDocument：表示文本文档，例如源文件 可以自行查看 api 哈
import { window, StatusBarItem, StatusBarAlignment, TextDocument } from 'vscode';
import * as vscode from 'vscode';

import { sockRunToken } from './sockRunToken';



export class ChangeTargetSshServer {
    static statusBar: StatusBarItem;
    static targetId: string;
    static lists: any;


    public static async init() {
        if (!ChangeTargetSshServer.statusBar) {
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
            for (let index = 0; index < lists.length; index++) {
                const element = lists[index];
                if (res == element.value_s) res = element;
            }
            ChangeTargetSshServer.targetId = res.ip + '-' + res.id;
            ChangeTargetSshServer.setLanguageText();
        }
    }


    static async setLanguageText() {
        let info = await ChangeTargetSshServer.getListCurrentOne();
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
            if (tmp && tmp['list_ssh']) {
                ChangeTargetSshServer.lists = tmp['list_ssh'];
            } else {
                console.log('3434343433----')
                console.log(tmp);
            }
        }

        return ChangeTargetSshServer.lists;
    }


    static async getListCurrent(keys?: string) {
        let info = await ChangeTargetSshServer.getListCurrentOne();
        if (keys) {

            if (keys == 'null') {
                ChangeTargetSshServer.statusBar.text = '$(project) ' + info.value;
            } else if (typeof keys == "object") {
                if (keys['name']) {
                    ChangeTargetSshServer.statusBar.text = '$(project) ' + info.value + '   ' + keys['name'];
                } else {
                    ChangeTargetSshServer.statusBar.text = '$(project) ' + info.value + '   ' + keys['user'] + '-' + keys['ip'];
                }
            } else {

                // 和当前相同
                if (info.key && info.key == keys) {
                    ChangeTargetSshServer.statusBar.text = '$(project) ' + info.value;
                    return;
                }

                let lists = await ChangeTargetSshServer.getListSsh();
                for (let index = 0; index < lists.length; index++) {
                    const element = lists[index];
                    if (element.key == keys) {
                        keys = element.value_tm;
                        break;
                    }
                }
                ChangeTargetSshServer.statusBar.text = '$(project) ' + info.value + '   ' + keys;
            }

        } else {
            return info;
        }
    }


    static async setListCurrent(keys: any) {
        if (!ChangeTargetSshServer.lists) return '';

        let lists = await ChangeTargetSshServer.getListSsh();
        let ssh = null;

        // ------  ------ [ 查找记录 ]
        if (typeof keys == "object") {

            if (keys['ip']) {
                for (let index = 0; index < lists.length; index++) {
                    const info = lists[index];
                    if (keys['id'] && keys['id'] == info.id) {
                        ssh = info;
                        break;
                    } else if (keys['ip'] == info.ip) {
                        ssh = info;
                        break;
                    }
                }
            }
        } else {
            for (let index = 0; index < lists.length; index++) {
                const element = lists[index];
                if (element.key == keys) {
                    ssh = element;
                    break;
                }
            }
        }

        if (ssh) {
            ChangeTargetSshServer.statusBar.text = '$(project) ' + ssh.value;
            ChangeTargetSshServer.targetId = ssh.ip + '-' + ssh.id;

        } else {
            let info = await ChangeTargetSshServer.getListCurrentOne();
            if (typeof keys == "object") {
                if (keys['name']) {
                    ChangeTargetSshServer.statusBar.text = '$(project) ' + info.value + '   ' + keys['name'];
                } else {
                    ChangeTargetSshServer.statusBar.text = '$(project) ' + info.value + '   ' + keys['user'] + '-' + keys['ip'];
                }
            } else {
                ChangeTargetSshServer.statusBar.text = '$(project) ' + info.value + '   ' + keys;
            }
        }

    }


    static async getListCurrentOne() {
        let lists = await ChangeTargetSshServer.getListSsh();
        let info = null;

        if (ChangeTargetSshServer.targetId) {
            let res = ChangeTargetSshServer.targetId.split('-');
            for (let index = 0; index < lists.length; index++) {
                const element = lists[index];
                if (element.id != res[1]) continue;
                info = element;
            }
            if (!info) {
                for (let index = 0; index < lists.length; index++) {
                    const element = lists[index];
                    if (element.ip != res[0]) continue;
                    info = element;
                }
            }
        }

        if (!info) info = lists[0];
        return info;
    }


}
