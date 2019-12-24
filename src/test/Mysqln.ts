// let mysql = require('mysql');                   //引入mysql模块
// var databaseConfig = require('./mysql.config'); //引入数据库配置模块中的数据


import * as mysql from 'mysql';
import {exit} from 'process';


// let db = require('mysql');                   //引入mysql模块



//配置链接数据库参数
let databaseConfig = {
  host: 'localhost',
  port: 3306,        //端口号
  database: 'test',  //数据库名
  user: 'test',      //数据库用户名
  password: 'test'   //数据库密码
};

databaseConfig['password'] = 'test';


//向外暴露方法
export class Mysqln {
  private pool: mysql.Pool;

  constructor(user = '') {
    if (user) {
      databaseConfig['user'] = user + '';
    }
    this.pool = mysql.createPool(databaseConfig);
    return this;
  }


  query(sql: string, values: any = null) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection(function(err, connection) {
        if (err) {
          reject(err);
        } else {
          connection.query(sql, values, (err, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows);
            }
            connection.release();
          });
        }
      });
    });
  }
}
