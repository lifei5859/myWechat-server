const path = require('path');

class Config {
    // DB_HOST: string = '127.0.0.1'
    DB_HOST: string = '49.234.184.195'
    DB_PORT: number = 3306
    // DB_USE: string = 'root'
    // DB_PASS: string = 'lifei5858'
    DB_USE: string = 'lifei5859'
    DB_PASS: string = 'Lifei%*%*528'
    DB_NAME: string = 'my_wechat'
    //http
    HTTP_HOST: string = 'http://127.0.0.1:5001'
    HTTP_PORT: number = 5001
    HTTP_STATIC: string = path.resolve(__dirname, './static')
    HTTP_UPLOAD: string = path.resolve(__dirname, './static/upload')
    HTTP_TEMPLATE: string = path.resolve(__dirname, './template')
    //keys
    KEY_LEN: number = 1024
    KEY_COUNT: number = 2048
    // jwtSecret
    JWT_SECRET: string = 'jhgJHGJHfHGfDGFDgfDgfgdgfGFDgfd_HGFFg%5edFDTR^^&rT%rYeRDTgfDgFDHGfHd'
    // admin
    PASS_SUFFIX: string = '_wocao%*'
}

const config: Config = new Config();

export default {...config}
