import { Util } from '../Util';
import { service as http } from '../lib/httpIndex';
import { outputChannel, AnyObj } from './../lib/const';


export function main(args: any) {
  const data:any = Util.getJsonData();
  let con: string = Util.getSelecttextLine().trim();

  let param:AnyObj = {"con": con};
  if(data.mysql && data.mysql.dbname){
    param.dbname = data.mysql.dbname;
  }

  http.post('/account/runmysql', Object.assign(param)).then(res => {
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