const { once } = require('events');
import fs = require('fs');
import readline = require('readline');
import path = require('path');

import { jsonData } from './cont';
import { smi } from './smi';




export interface AnyObj {
    [name: string]: any;
}

/**
 * 自定义深度的数组合并
 * @param args 数组
 */
function merge(...args: any[]): any {
    let deel = 2;
    if (typeof args[0] === 'number') {
        deel = args[0];
        args = args.slice(1);
    } else if (typeof args[0] === 'boolean') {
        deel = -1;
        args = args.slice(1);
    }
    let tm = [];
    for (const key in args) {
        if (typeof args[key] === 'object') {
            tm.push(args[key]);
        }
    }
    args = tm;
    if(tm.length===0){
        return {};
    }else if(tm.length === 1){
        return tm[0];
    }
    let data = args[0];

    for (const k in args[1]) {
        if (data.hasOwnProperty(k)) {
            if (typeof data[k] !== typeof args[1][k]) {
                data[k] = args[1][k];
            } else if (typeof data[k] === 'string') {
                if(data[k].length ===0 ){
                    data[k] = args[1][k];
                }
            } else if (typeof data[k] === 'object') {
                if(deel>1 || deel < 0){
                    data[k] = merge(--deel, data[k], args[1][k]);
                }else{
                    data[k] = args[1][k];
                }
            }
        } else {
            data[k] = args[1][k];
        }
    }
    if (args.length > 2) {
        args = args.slice(2);
        args.unshift(data);
        args.unshift(deel);
        return merge.apply(null, args);
    } else {
        return data;
    }
}

var obj1 = { a: 1 };
var obj2 = { b: { cc: 232, k: 333,d:{a:1,b:2} } };
var obj3 = { b: { aa: 22,d:{c:23232} } };
let aa = merge(3, 'dfdfd', [443, '143'], obj1, obj2, obj3);
console.log(aa);



