

import {Mysqln} from './Mysqln';
import { exists } from 'fs';
import { exit } from 'process';


console.log(3443);

let Db:Mysqln = new Mysqln("test");
// let Db:Mysqln = new Mysqln();

console.log('数据库链接2222');

async function selectAllData( ) {
    // let sql = 'SELECT * FROM my_table';
    let sql = 'show databases;';
    let dataList = await Db.query( sql );
    return dataList;
}

async function getData() {
    console.log('22-1');
    let dataList;
    // let dataList = await selectAllData();

    let sql = 'show databases;';
    dataList = await Db.query( sql );
    console.log(dataList);
    
    sql = 'show tables;';
    dataList = await Db.query( sql );
    console.log(dataList);
    console.log(23323232);
    
    exit();
}
console.log(22);
getData();
console.log(33);



// Db.query('show databases;', [],function(result:any,fields:any){
//     console.log('查询结果：');
//     // console.log(result);
//     // console.log(fields);

// });



// let db = require('./test');


// // 查询实例
// Mysqln.query('show databases;', [],function(result:any,fields:any){
//     console.log('查询结果：');
//     console.log(result);
//     console.log(fields);
// });




// //添加实例
// var  addSql = 'INSERT INTO websites(username,password) VALUES(?,?)';
// var  addSqlParams =['咕噜先森', '666'];
// db.query(addSql,addSqlParams,function(result,fields){
//     console.log('添加成功')
// })

// // 删除
// connection.query('DELETE FROM t_user  WHERE id = 1', (err, results) => {
//     if(err){
//         console.log(err);
//     }
//     console.log(results);
// })


// // 更新
// connection.query('UPDATE t_user SET pass = "321" WHERE username = "whg"', (err, results) => {
//     if(err){
//         console.log(err);
//     }
//     console.log(results);
// })

// // 结束连接
// connection.end(function(err) {
// });
// connection.destroy();