


import {service} from '../lib/httpIndex';


// http://note.flyskycode.cn/test/test_show.php
let param = {"type":"websock", "run":"refresh_page"};

var da1:any = new Date();

service.post('/refresh_page', Object.assign(param)).then(res => {
console.log( res );

  var da2:any = new Date();
  console.log( da2 - da1 );

});


// import { WebSocket } from 'ws';

// post {{url}}/refresh_page
// Content-Type: application/x-www-form-urlencoded

// type=websock
// &run=refresh_page

