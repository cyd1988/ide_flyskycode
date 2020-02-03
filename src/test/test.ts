const { once } = require('events');
import fs = require('fs');
import readline = require('readline');
import path = require('path');

import { jsonData } from './cont';
import { smi } from './smi';

export interface AnyObj {
    [name: string]: any;
  }


let obj:AnyObj = {"fdfd":4343,"afd":3311};

for (const key in obj) {
console.log( key );
console.log( obj[key] );
    if (obj.hasOwnProperty(key)) {
        const element = obj[key];
        
    }
}


// console.log( jsonData.d );

// smi();

// interface namelist { 
//   [index:string]:any 
// } 
// var list2:namelist = ["John",1,"Bran"] ;


// let obj:any{} = {};


// obj.aa = path;

// console.log(obj);










