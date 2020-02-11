"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require('path');
class Config {
    constructor() {
        this.DB_HOST = '127.0.0.1';
        this.DB_PORT = 3306;
        this.DB_USE = 'mySql';
        this.DB_PASS = 'lifei5858';
        this.DB_NAME = 'myTest';
        //http
        this.HTTP_HOST = 'http://127.0.0.1:5001';
        this.HTTP_PORT = 5001;
        this.HTTP_STATIC = path.resolve(__dirname, './static');
        this.HTTP_UPLOAD = path.resolve(__dirname, './static/upload');
        this.HTTP_TEMPLATE = path.resolve(__dirname, './template');
        //keys
        this.KEY_LEN = 1024;
        this.KEY_COUNT = 2048;
        // admin
        this.PASS_SUFFIX = '_wocao%*';
    }
}
const config = new Config();
exports.default = Object.assign({}, config);
//# sourceMappingURL=config.js.map