import * as vscode from 'vscode';
import { Util } from '../Util';
import { service as http } from '../lib/httpIndex';
import { outputChannel, AnyObj } from './../lib/const';


export function main(args: any) {
  const data:any = Util.getJsonData();
  let con: string = Util.getSelecttextLine().trim();
  let param:AnyObj = {"type":"websock","con": con}; 
  http.post('/account/decode', Object.assign(param)).then(res => {
    if( res.status+'' === 'success'){
      outputChannel.show();
      outputChannel.clear();
      outputChannel.appendLine(res.data.con);
    }else{
      Util.showError(res.status+'');
      console.log( res );
    }
  });

}