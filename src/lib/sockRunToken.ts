

import { MessageService } from './webSocket';
import { Api } from '../lib/api';
import { apiModel } from './../lib/apiModel';


const sleep = () => new Promise((res, rej) => setTimeout(res, 2));



export class sockRunToken {

  static getToken() {
    return (new Date()).getTime();
  }

  // 返回结果 的地址信息
  static getRunTokenApi() {
    let run_api;
    if (MessageService.SystemKeysList['serverRunTokenUrl']) {
      run_api = MessageService.SystemKeysList['serverRunTokenUrl'];
    } else {
      run_api = {
        u: "/init/serverRunTokenMethod",
        p: {
          'empty': '',
        }
      };
    }
    return run_api;
  }


  // 返回结果
  static sendRunTokenApi(data: any, old_data: any) {
    let run_api = this.getRunTokenApi();
    
    run_api['p'] = {'source':data, 'ServerRunToken':''};

    if (old_data.hasOwnProperty('ServerRunToken')) {
      run_api['p']['ServerRunToken'] = old_data['ServerRunToken'];
      // console.log( 'sendRunTokenApi' );
      // console.log( run_api );
      apiModel.r_api(run_api);
    }  
  }



  // 发送并获取结果
  static async apiRun(data: any) {

    Api.run(data);
    let info: any;
    let runToken = data.api.p.runToken;

    for (let index = 0; index < 160; index++) {
      if (MessageService.runTokens[runToken]) {
        info = MessageService.runTokens[runToken];
        delete (MessageService.runTokens[runToken]);
        break;
      }
      await sleep();
    }
    return info;
  }







  /**
   * 分析返回维埃里
   * 功能列表: 
   * 1. 如果为 runTOken 的返回就不处理，添加到 MessageService.runTokens 列表
   * 2. 如果查找到就，外理下 MessageService.runTokens 的超时内容
   * 说明: 
   * #. 如果查找到就不进行后边的外理
   * @param data 返回的结果
   */
  static runToken(data: any) {

    if (
      data.hasOwnProperty('data') &&
      typeof data.data === 'object' &&
      data.data.hasOwnProperty('runToken') &&
      data.data.runToken !== '') {

      let new_time = (new Date()).getTime();
      let info = data.data;

      info['runTokenAddTime'] = new_time;

      MessageService.runTokens[info.runToken] = info;


      for (const key in MessageService.runTokens) {
        if (MessageService.runTokens.hasOwnProperty(key)) {

          const element = MessageService.runTokens[key];

          if (new_time - element['runTokenAddTime'] > 30 * 1000) {
            delete (MessageService.runTokens[key]);
          }

        }
      }

      return true;
    } else {
      return false;
    }
  }




}
