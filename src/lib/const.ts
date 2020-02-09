import * as vscode from 'vscode';

export const outputChannel = vscode.window.createOutputChannel('outputname');


export interface AnyObj {
  [name: string]: any;
}

export class JsonData {
  static v: AnyObj = {};
}

export class StatusBarMessage {
  static nIntervId: AnyObj = {};
  static data: AnyObj = {};
  static max = 26;
  static lm: string = '.';
  static slm = '+';

  static delAllStatusBarMessage(){
    if(this.nIntervId.length<=0){
      return;
    }
    let ar :string[]=[];
    for (const key in this.nIntervId) {
      ar.push(key);
    }
    ar.forEach(val => {
      this.delStatusBarMessage(val);
    });
  }

  static delStatusBarMessage(key: string) {
    if (this.nIntervId[key]) {
      vscode.window.setStatusBarMessage('');
      clearInterval(this.nIntervId[key]);
      delete (this.nIntervId[key]);
      delete (this.data[key]);
    }
  }
  static setStatusBarMessage(key: string, times = 50) {
    this.data[key] = { runNum: 0 };
    this.nIntervId[key] = setInterval(function () {
      let text = key;
      let max = StatusBarMessage.max;
      let num: number;
      ++StatusBarMessage.data[key].runNum;

      if (StatusBarMessage.data[key].runNum > max) {
        StatusBarMessage.data[key].runNum = 0;
      }
      num = StatusBarMessage.data[key].runNum;
      if (num > 1) {
        text += StatusBarMessage.slm.repeat(num - 1);
      }
      text += StatusBarMessage.slm;
      if (num < max) {
        text += StatusBarMessage.lm.repeat(max - num);
      }
      vscode.window.setStatusBarMessage(text);
    }, times);
  }
}



