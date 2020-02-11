const mysql: any = require('mysql');                            // 导入mysql模块

import config from '../config';                                 // 导入配置文件

const {DB_HOST, DB_NAME, DB_PORT, DB_PASS, DB_USE} = config;    // 声明 db相关信息

// mysql配置类
class DBOptions {
    readonly host: string = DB_HOST
    readonly user: string = DB_USE
    readonly database: string = DB_NAME
    readonly password: string = DB_PASS
    readonly port: number = DB_PORT
}

// 声明mysql配置常量
const dbOptions = new DBOptions();

// 创建mysql连接池
const pool = mysql.createPool(dbOptions);

// 导出mysql 方法
export const createCoon = function (sql: string, values?: Array<number | string>) {
    return new Promise((resolve: Function, reject: Function) => {
        pool.getConnection(function (err: any, connection: any) {
            if (err) {
                reject(err)
            } else {
                connection.query(sql, values, (err: any, rows: any) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(rows)
                    }
                    connection.release()
                })
            }
        })
    }).then((res) => {
        return res
    }, (err) => {
        return err
    })
}

// export const coon = function (sql: string, values?: Array<number | string>) {
//   return createCoon(sql, values).then((res) => {
//     return res
//   }, (err) => {
//     console.log(err, '}}}}}}}}}}}')
//     return err
//   })
// }

// export const createCoon = function (sql: string, values?: Array<number | string>) {
//   console.log(sql, values, '=======')
//   pool.query(sql, values, (err: any, res: any[]) => {
//     if (err) {
//       return new Promise(function(){}).catch(err)
//     } else {
//       console.log(res)
//       return res
//     }
//   });

// }
