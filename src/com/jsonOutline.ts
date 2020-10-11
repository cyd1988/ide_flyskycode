import * as vscode from 'vscode';
import * as json from 'jsonc-parser';
import * as path from 'path';
import { Util } from '../Util';
// import axios from 'axios';
import { configUrl } from './../lib/const';


export function Jsoncd_init(context: vscode.ExtensionContext) {
    Jsoncd.main(context);
}


export class Jsoncd {
    static json: JsonOutlineProvider;
    static main(context: vscode.ExtensionContext) {
        this.json = new JsonOutlineProvider(context);
        vscode.window.registerTreeDataProvider('flyskycodeData', this.json);

        vscode.commands.registerCommand('flyskycodeData.refresh', () => this.json.refresh());
        vscode.commands.registerCommand('flyskycodeData.refreshNode', offset => this.json.refresh(offset));
        vscode.commands.registerCommand('flyskycodeData.renameNode', offset => this.json.rename(offset));
        vscode.commands.registerCommand('extension.openJsonSelection', range => this.json.select(range));
    }
}







export class JsonOutlineProvider implements vscode.TreeDataProvider<number> {

    private _onDidChangeTreeData: vscode.EventEmitter<number | null> = new vscode.EventEmitter<number | null>();
    readonly onDidChangeTreeData: vscode.Event<number | null> = this._onDidChangeTreeData.event;

    private tree: json.Node;
    private text: string = '';
    private json: any;
    private editor: vscode.TextEditor | undefined;
    private autoRefresh: boolean | undefined = true;
    private sshnData:any = {};
    constructor(private context: vscode.ExtensionContext) {
        this.json = { ssh: "", sshn: "" };
        this.text = JSON.stringify(this.json);
        this.tree = json.parseTree(this.text);
    }
    setJson(data: any): void {
        this.json = Util.merge(true, this.json, data);
        this.parseTree();
        this.refresh();

        if (this.json.ssh && this.json.sshn.indexOf(this.json.ssh) === -1) {
            this.getSshName();
        }
    }


    async getSshName() {
        if(this.sshnData[this.json.ssh]){
            this.json.sshn = this.sshnData[this.json.ssh];
            this.parseTree();
            this.refresh();
        }else{

            // let data = {
            //     "con": this.json.ssh,
            //     "notGetJsonData": 1,
            //     'getInfo': 1
            // };
            // axios.post(configUrl + '/account/decode', Object.assign(data)).then(res => {
            //     if(res.status === 200 && res.data.status === 'success'){
            //         this.json.sshn = res.data.data.info.sshn;
            //         this.sshnData[this.json.ssh] = this.json.sshn;
            //         this.parseTree();
            //         this.refresh();
            //     }
            // });
        }
    }


    getJson() {
        return this.json;
    }


    private parseTree(): void {
        this.text = JSON.stringify(this.json);
        this.tree = json.parseTree(this.text);
    }

    refresh(offset?: number): void {
        this.parseTree();
        if (offset) {
            this._onDidChangeTreeData.fire(offset);
        } else {
            this._onDidChangeTreeData.fire(1);
        }
    }

    rename(offset: number): void {
        vscode.window.showInputBox({ placeHolder: 'Enter the new label' })
            .then(value => {
                if (value !== null && value !== undefined) {
                    this.parseTree();
                    this.refresh();
                }
            });
    }

    getChildren(offset?: number): Thenable<number[]> {
        if (offset) {
            const path = json.getLocation(this.text, offset).path;
            const node = json.findNodeAtLocation(this.tree, path);
            if (node) {
                return Promise.resolve(this.getChildrenOffsets(node));
            } else {
                return Promise.resolve([0]);
            }
        } else {
            return Promise.resolve(this.tree ? this.getChildrenOffsets(this.tree) : []);
        }
    }

    private getChildrenOffsets(node: json.Node): number[] {
        const offsets: number[] = [];
        if (!node.children) {
            return offsets;
        }
        for (const child of node.children) {
            const childPath = json.getLocation(this.text, child.offset).path;
            const childNode = json.findNodeAtLocation(this.tree, childPath);
            if (childNode) {
                offsets.push(childNode.offset);
            }
        }
        return offsets;
    }


    getTreeItem(offset: number): vscode.TreeItem {
        const path = json.getLocation(this.text, offset).path;
        const valueNode = json.findNodeAtLocation(this.tree, path);
        if (valueNode) {
            let child;
            if (valueNode.type === 'object') {
                child = vscode.TreeItemCollapsibleState.Expanded;
            } else if (valueNode.type === 'array') {
                child = vscode.TreeItemCollapsibleState.Collapsed;
            } else {
                child = vscode.TreeItemCollapsibleState.None;
            }

            let treeItem: vscode.TreeItem = new vscode.TreeItem(
                this.getLabel(valueNode),
                child
            );

            treeItem.command = {
                command: 'extension.openJsonSelection',
                title: '',
                arguments: ['fsdfd']
            };
            treeItem.iconPath = this.getIcon(valueNode);
            treeItem.contextValue = valueNode.type;

            return treeItem;
        } else {
            return new vscode.TreeItem('解析错误');
        }
    }

    select(range: any) {
        // this.editor.selection = new vscode.Selection(range.start, range.end);
    }

    private getIcon(node: json.Node): any {
        let nodeType = node.type;
        if (nodeType === 'boolean') {
            return {
                light: this.context.asAbsolutePath(path.join('resources', 'light', 'boolean.svg')),
                dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'boolean.svg'))
            };
        }
        if (nodeType === 'string') {
            return {
                light: this.context.asAbsolutePath(path.join('resources', 'light', 'string.svg')),
                dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'string.svg'))
            };
        }
        if (nodeType === 'number') {
            return {
                light: this.context.asAbsolutePath(path.join('resources', 'light', 'number.svg')),
                dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'number.svg'))
            };
        }
        return null;
    }

    private getLabel(node: json.Node): string {
        if (!node.parent || !node.parent.children) {
            return '';
        }

        if (node.parent.type === 'array') {
            let prefix = node.parent.children.indexOf(node).toString();
            if (node.type === 'object') {
                return prefix + ':{ }';
            }
            if (node.type === 'array') {
                return prefix + ':[ ]';
            }
            return prefix + ':' + node.value.toString();
        }
        else {
            const property = node.parent.children[0].value.toString();
            if (node.type === 'array' || node.type === 'object') {
                if (node.type === 'object') {
                    return '{ } ' + property;
                }
                if (node.type === 'array') {
                    return '[ ] ' + property;
                }
            }
            // const value = this.editor.document.getText(new vscode.Range(this.editor.document.positionAt(node.offset), this.editor.document.positionAt(node.offset + node.length)));

            const value = node.value;
            return `${property}: ${value}`;
        }
    }
}