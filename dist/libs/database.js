"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql = require('mysql');
const config_1 = require("../config");
const { DB_HOST, DB_NAME, DB_PORT, DB_PASS, DB_USE } = config_1.default;
class DBOptions {
    constructor() {
        this.host = DB_HOST;
        this.use = DB_USE;
        this.database = DB_NAME;
        this.password = DB_PASS;
        this.port = DB_PORT;
    }
}
const dbOptions = new DBOptions();
console.log(dbOptions, '========....');
let pool = mysql.createPool(dbOptions);
exports.createCoon = pool;
// export const createCoon = function( sql: string, values?: Array<number | string> ) {
//     console.log(sql, values, '=======')
//     return new Promise(( resolve: Function, reject: Function ) => {
//       pool.getConnection(function(err: any, connection: any) {
//         if (err) {
//             console.log(err, '[[[[[[')
//           reject( err )
//         } else {
//           connection.query(sql, values, ( err: any, rows: any) => {
//             if ( err ) {
//               reject( err )
//             } else {
//               resolve( rows )
//             }
//             connection.release()
//           })
//         }
//       })
//     })
//   }
//# sourceMappingURL=database.js.map