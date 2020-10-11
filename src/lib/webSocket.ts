
import * as WebSocket from "ws";

import { Api } from './../lib/api';
import { Util } from '../Util';
import e = require("express");

import { sockRunToken } from './sockRunToken';
import { ChangeTargetSshServer } from './../lib/ChangeTargetSshServer';


let webSocketStatus = 0;




/**
 * 快捷键-方法映射存储
 * 检查是否返回 SystemKeysList 快捷键-方法映射
 * @param data 返回结果
 */
function runSystemKeysList(data: any) {
  let back = false;

  if (
    data.hasOwnProperty('data') &&
    typeof data.data === 'object' &&
    data.data.hasOwnProperty('SystemKeysList')) {

    MessageService.SystemKeysList = data.data['SystemKeysList'];
    MessageService.SystemConst = data.data['SystemConst'];

    back = true;
  }

  return back;
}


/**
 * 1. 重置 快捷键-方法映射
 * 1. 发起一个 快捷键-方法映射 的请求
 */
function runSystemKeysListReloat() {
  MessageService.SystemKeysList = {}
  let data = {
    run: 'api',
    api: {
      u: "/init/getKeysFigs",
      p: {
        'empty': '',
      }
    }
  };
  Api.run(data);
}






export class MessageService {
  webSocket: WebSocket;
  url = '127.0.0.1:9502';
  types = '';
  static obj: any;
  static arr: any[] = [];
  static runTokens: any = {};
  static SystemKeysList: any = {};
  static SystemConst: any = {};
  static reload_time: Date = new Date(-3);


  static async start() {
    if (!this.obj) {
      this.obj = new MessageService();
    }
  }


  static async send(masg?: Object | string) {
    if (masg) {
      this.arr.push(masg);
    }

    if (!this.obj) {
      this.obj = new MessageService();
    } else if (webSocketStatus) {
      if (this.arr.length === 0) {
        return;
      }

      let data = this.arr.shift();

      let masg_str = data;
      if (typeof masg_str === 'object') {
        masg_str = JSON.stringify(masg_str);
      }

      this.obj.webSocket.send(masg_str, (aa: any) => {
        MessageService.send();
      });
    }
  }

  static async reload(run?: number) {
    this.arr = [];
    if (webSocketStatus) {
      return;
    }
    let time = 1500;
    let data_n = new Date();

    if (run) {
      this.obj = new MessageService();
    }

    if (data_n.getTime() - this.reload_time.getTime() > time) {
      this.reload_time = data_n;
      setTimeout(function () {
        MessageService.reload(1);
      }, time + 30);
    }
  }



  // async inits() {
  constructor() {
    let url = `ws://${this.url}/${this.types}`;
    this.webSocket = new WebSocket(url);
    this.webSocket.onopen = this.webSocketOnOpen;
    this.webSocket.onclose = this.webSocketOnClose;
    this.webSocket.onmessage = this.webSocketOnMessage;
    this.webSocket.onerror = this.webSocketOnError;
    // this.webSocket.send();
  }

  // 建立连接成功后的状态
  webSocketOnOpen(event: WebSocket.OpenEvent) {
    webSocketStatus = 1;
    MessageService.webSocketOnOpen_run();
  }

  static async webSocketOnOpen_run() {
    await ChangeTargetSshServer.init();
    await runSystemKeysListReloat();
  }

  // 获取到后台消息的事件，操作数据的代码在onmessage中书写
  webSocketOnMessage(res: WebSocket.MessageEvent) {

    try {
      let data = JSON.parse(res.data + '');

      if (sockRunToken.runToken(data)) { return; }

      if (runSystemKeysList(data)) { return; }


      if (data.status === 'success') {
        Api.res(data);

        if (typeof data.data === 'object' && data.data.show_msg) {
          Util.showInfo(data.data.show_msg);
        } else if (typeof data.data === 'object' && data.data.show_msg_error) {
          Util.showError(data.data.show_msg_error);
        }
      } else {
        Util.showError('错误', data);
      }

    } catch (error) {
      Util.showError('错误-catch', res);
    }

    //给后台发送数据
    // this.webSocket.send();

  }
  // 关闭连接
  webSocketOnClose() {
    MessageService.SystemKeysList = {}
    webSocketStatus = 0;
    console.log('websocket连接已关闭');
    MessageService.reload();
  }

  //连接失败的事件
  webSocketOnError(res: any) {
    MessageService.SystemKeysList = {}
    webSocketStatus = 0;
    ChangeTargetSshServer.lists = null;
    console.log('websocket连接失败');
    MessageService.reload();
    // 打印失败的数据
    // console.log(res);
  }

  destroyed() {
    // 页面销毁关闭连接
    this.webSocket.close();
  }
}

