import * as vscode from 'vscode';

export const outputChannel = vscode.window.createOutputChannel('outputname');


export interface AnyObj {
  [name: string]: any;
}

export class JsonData {
  static v: AnyObj = {};
}



