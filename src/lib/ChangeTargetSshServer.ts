// TextDocument：表示文本文档，例如源文件 可以自行查看 api 哈
import { window, StatusBarItem, StatusBarAlignment, TextDocument } from 'vscode';
import * as vscode from 'vscode';

import { sockRunToken } from './sockRunToken';
import { Util } from './../Util';



export class ChangeTargetSshServer {
    static statusBar: StatusBarItem;
    static targetId: string;
    static lists: any;
    static ints_stat = 0;
    static git_num = 0;
    static status_bar_text = '';

    public static async init() {
        if (!ChangeTargetSshServer.statusBar) {
            ChangeTargetSshServer.statusBar =
                vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
            ChangeTargetSshServer.statusBar.command =
                'extension.demo.changeTargetSshServer';
            ChangeTargetSshServer.statusBar.tooltip = '选择要使用的SSH账号！';
            ChangeTargetSshServer.statusBar.color = '#00AA00';
        }

        await ChangeTargetSshServer.setLanguageText();
        ChangeTargetSshServer.statusBar.show();
        ChangeTargetSshServer.ints_stat = 1;

        ChangeTargetSshServer.up_get_num();
    }


    public static async changeTargetLanguage() {
        ChangeTargetSshServer.up_get_num();
        let lists = await ChangeTargetSshServer.getListSsh();
        let res: any = await vscode.window.showQuickPick(
            lists.map((item: any) => item.value_s),
            {
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
        let val = '$(project) ' + info.value;
        ChangeTargetSshServer.set_statusBar(val);
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
            let val = '';
            if (keys == 'null') {
                val = '$(project) ' + info.value;
            } else if (typeof keys == "object") {
                if (keys['name']) {
                    val = '$(project) ' + info.value + '   ' + keys['name'];
                } else {
                    val = '$(project) ' + info.value + '   ' + keys['user'] +
                        '-' + keys['ip'];
                }
            } else {

                // 和当前相同
                if (info.key && info.key == keys) {
                    val = '$(project) ' + info.value;
                } else {
                    let lists = await ChangeTargetSshServer.getListSsh();
                    for (let index = 0; index < lists.length; index++) {
                        const element = lists[index];
                        if (element.key == keys) {
                            keys = element.value_tm;
                            break;
                        }
                    }
                }

                val = '$(project) ' + info.value + '   ' + keys;
            }
            ChangeTargetSshServer.set_statusBar(val);
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
        let val = '';
        if (ssh) {
            val = '$(project) ' + ssh.value;
            ChangeTargetSshServer.targetId = ssh.ip + '-' + ssh.id;
        } else {
            let info = await ChangeTargetSshServer.getListCurrentOne();
            if (typeof keys == "object") {
                if (keys['name']) {
                    val = '$(project) ' + info.value + '   ' + keys['name'];
                } else {
                    val = '$(project) ' + info.value + '   ' + keys['user'] +
                        '-' + keys['ip'];
                }
            } else {
                val = '$(project) ' + info.value + '   ' + keys;
            }
        }
        ChangeTargetSshServer.set_statusBar(val);

    }


    static set_statusBar(val: string) {
        ChangeTargetSshServer.status_bar_text = val;
        if (ChangeTargetSshServer.git_num > 0) {
            val = val + '   - ' + ChangeTargetSshServer.git_num;
        }
        ChangeTargetSshServer.statusBar.text = val;
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


    static set_update_git_num(num: number) {
        ChangeTargetSshServer.git_num = num;
        let val = ChangeTargetSshServer.status_bar_text;
        ChangeTargetSshServer.set_statusBar(val);
    }

    static up_get_num() {
        let tm = Util.getWorkspaceFolders(1);
        let run_cwd = tm[0];

        // console.log('util-dir: ', run_cwd);
        // D:\Development\PortableGit\cmd\git.exe

        let bash = 'git status -s';
        if (Util.is_window()) {
            // bash = '"D:\\Development\\PortableGit\\cmd\\git.exe" status -s';
            if (run_cwd[0] == '/') run_cwd = run_cwd.substring(1);
        }

        // console.log('util-bash: ', bash);
        // console.log('util-run_cwd: ', run_cwd);

        Util.exec(bash, { 'cwd': run_cwd }, function (error: any, stdout: Buffer, stderr: Buffer) {
            let aa = stdout.toString() + "";

            // console.log('util-con: ', aa);

            let num = 0;
            let l = aa.length;
            if (l > 2) {
                if (aa[l - 2] + aa[l - 1] == "\r\n") aa = aa.substring(0, l - 3);
                if (aa[l - 1] == "\n") aa = aa.substring(0, l - 2);
            }
            l = aa.length;
            if (l > 0) num++;

            for (let ind = 0; ind < l; ind++) {
                if (aa[ind] == "\n") num++;
            }

            ChangeTargetSshServer.set_update_git_num(num);
        });

    }

}
