
import * as WebSocket from "ws";

import { Api } from './../lib/api';
import { Util } from '../Util';


let webSocketStatus = 0;

export class MessageService {
  webSocket: WebSocket;
  url = '127.0.0.1:9502';
  types = '';
  static obj: any;
  static arr: any[] = [];
  static reload_time: Date = new Date(-3);

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

      masg = this.arr.shift();
      if (typeof masg === 'object') {
        masg = JSON.stringify(masg);
      }

      this.obj.webSocket.send(masg, (aa: any) => {
        // console.log('aaa', aa);
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
    MessageService.send();
  }
  // 获取到后台消息的事件，操作数据的代码在onmessage中书写
  webSocketOnMessage(res: WebSocket.MessageEvent) {

    try {

      let data = JSON.parse(res.data + '');
      if (data.status === 'success') {
        Api.res(data);

        if (typeof data.data === 'object' && data.data.show_msg) {
          Util.showInfo(data.data.show_msg);
        }else if (typeof data.data === 'object' && data.data.show_msg_error) {
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
    webSocketStatus = 0;
    console.log('websocket连接已关闭');
    MessageService.reload();
  }

  //连接失败的事件
  webSocketOnError(res: any) {
    webSocketStatus = 0;
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

