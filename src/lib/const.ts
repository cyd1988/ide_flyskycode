import * as vscode from 'vscode';

import os = require("os");
import * as child_process from 'child_process';
import { Util } from './../Util';

export const outputChannel = vscode.window.createOutputChannel('outputname');

export const configUrl = 'http://blog.laravel.flyskycode.cn/ide/v1';


let var_service_host_ip = '';
export const service_host_ip = function () {

  if (var_service_host_ip.length < 1) {
    let types = service_type();
    // var_service_host_ip = '192.168.71.1';
    var_service_host_ip = '127.0.0.1';

    if (types == 'linux-centos') {
      var_service_host_ip = '127.0.0.1';

    } else if (types == 'linux-ubuntu') {

      let bash = 'bash /Users/fletc/bin/tool_Host_ip.sh';
      let ips = child_process.execSync(bash).toString();
      if (ips.length > 3) {
        var_service_host_ip = ips;
      }
    }
  }
  return var_service_host_ip;
}


let var_service_type = '';
export const service_type = function () {
  if (var_service_type.length < 1) {
    var_service_type = 'window';
    if (os.platform() == 'linux') {
      if (Util.isfile('/etc/centos-release')) {
        var_service_type = 'linux-centos';
      } else {
        var_service_type = 'linux-ubuntu';
      }
    }
  }
  return var_service_type;
}


export interface AnyObj {
  [name: string]: any;
}



export class StatusBarMessage {
  static nIntervId: AnyObj = {};
  static data: AnyObj = {};
  static max = 26;
  static lm: string = '-';
  static slm = '+';

  static delAllStatusBarMessage() {
    if (this.nIntervId.length <= 0) {
      return;
    }
    let ar: string[] = [];
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



