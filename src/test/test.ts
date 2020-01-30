const { once } = require('events');
import fs = require('fs');
import readline = require('readline');
import path = require('path');



interface Person3 {
  name: string;
  val: any;
}
interface Child extends Person3 {}
let autoregistertexteditor: Person3[] = [];

let item: Person3 = {"name":"dfdd","val":path};

autoregistertexteditor.push(item);

// console.log(autoregistertexteditor);

interface Person {
  [name: string]: any;
}
let ac:Person = {name:'43'};

ac.ccc= 4343;
ac.ddd = 'ffdfd';
console.log(ac['cccq']);
console.log(ac);


// interface namelist { 
//   [index:string]:any 
// } 
// var list2:namelist = ["John",1,"Bran"] ;


// let obj:any{} = {};


// obj.aa = path;

// console.log(obj);










