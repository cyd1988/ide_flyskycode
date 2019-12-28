const { once } = require('events');
import fs = require('fs');
import readline = require('readline');
import path = require('path');


let files = '/Users/webS/www/mynotes/web/test/my/sublime/dir/常用测试.txt';

let lm_strat:string = 'sublime_list_start:';
let lm_end:string = 'sublime_list_end:';


(async function processLineByLine() {
    try {
      const rl = readline.createInterface({
        input: fs.createReadStream(files),
        crlfDelay: Infinity
      });
      
    //   let status = 'start';
      let data = Array();
      let tmp = {"name":"","list":Array(),"status":"","num":0,"val":["",""]};
      rl.on('line', (line) => {
        let strs = line.trim();
        if( tmp['status'] === '' ){
            if( strs.startsWith( lm_strat ) ){
                tmp['name'] = strs.substr( lm_strat.length );
                tmp['status'] = 'start';
                tmp['num'] = 0;
            }
        }else if( tmp['status'] === 'start' ){
            if( strs.startsWith( lm_end ) ){
                data.push([tmp['name'], tmp['list']]);
                tmp['status'] = '';
                tmp['list'] = Array();
                tmp['num'] = 0;

            }else{
                if( tmp['num'] % 2 === 0 ){
                    tmp['val'][0] = strs;
                }else{
                    tmp['val'][1] = strs;
                    if( tmp['val'][0].length < 1 ){
                        tmp['val'][0] = path.basename( strs );
                    }
                    
                    tmp['list'].push( [tmp['val'][0],tmp['val'][1]] );
                }
                ++tmp['num'];
            }
        }
      });
  
      await once(rl, 'close');
      
      console.log(data);
      console.log(data[0][1]);
      console.log(data[1][1]);
      console.log(data[2][1]);
      
    } catch (err) {
      console.error(err);
    }
  })();



