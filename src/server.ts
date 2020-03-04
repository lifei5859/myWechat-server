const Koa = require('koa');                           // 导入koa
const Router = require('koa-router');                 // 导入koa-router
const body = require('koa-body');                     // post解析
const koaJwt = require('koa-jwt');                    // koa监控token
const jwt = require('jsonwebtoken');                  // 生成token
const serverStatic = require('./routers/static');     // 静态文件模块
// const socket = require('socket.io');                  // 引入webSocket模块
// const http = require('http');                         // 引入http模块
const websocket = require('koa-websocket');          // 引入webSocket模块
// const logger = require('koa-logger');                // 引入日志中间件
const logger = require('koa-sam-log');
const moment = require('moment');
const fs=require("fs");

// import {app} from './init'
import {genToken} from './libs/jwtToken';             // 解析token
import config from './config';                        // 倒入配置文件
import {createCoon} from './libs/database';           // mysql模块
import {api} from './routers/api';                    // /api路由模块
import {admin} from './routers/admin';                // /admin路由模块
import {io} from './routers/webSocket';               // /webSocket路由模块

const {HTTP_HOST, HTTP_PORT, HTTP_UPLOAD, JWT_SECRET} = config;
const app = websocket(new Koa());                                // 新建一个Koa对象
// const httpApp: any = http.Server(app.callback());     // 创建http服务
// const io = socket(httpApp);                           // 创建webSocket服务
const router = new Router();                          // 新建一个koa-router对象

app.context.db = createCoon;                          // mysql方法挂载到上下文

// 当token快失效时有请求发来 更新token
app.use(async (ctx: any, next: Function) => {
    console.log(ctx.url)
    // const user: string = ctx.req.headers['my-mail'];
    const tempToken: string = ctx.req.headers['authorization'];
    if (!tempToken) {
        await next();
        return
    }
    const token: string = tempToken.split(' ')[1];
    const tokenObj: any = await genToken(token, JWT_SECRET)
    // console.log(user, token, tokenObj, Date.now());
    const restTime: number = tokenObj.result.exp - tokenObj.result.iat
    if (restTime < (60 * 60 * 24 * 4)) {
        let newToken: string = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 10),
            data: tokenObj.result.data
        }, JWT_SECRET);
        ctx.set('new-token', newToken);
    }

    await next()
});

// api开头路由
router.use('/api', api);

// 后台管理路由
router.use('/admin', admin);

// socket连接
router.use('/webSocket', io);

// 上传目录
app.use(body({
    multipart: true,
    formidable: {
        uploadDir: `${HTTP_UPLOAD}/${ moment().format('YYYY-MM-DD')}`,
        onFileBegin: (name: any, file: any) => {
            console.log(name, file)
            let flag = fs.existsSync(HTTP_UPLOAD + '\\' + moment().format('YYYY-MM-DD'))
            if(!flag) fs.mkdirSync(HTTP_UPLOAD + '\\' + moment().format('YYYY-MM-DD'))

            file.path = HTTP_UPLOAD + '\\' + moment().format('YYYY-MM-DD') + '\\' + file.name
        }
    }
}));

// 日志中间件使用
app.use(logger({
    type: 'dateFile',
    filename: 'logs/',
    pattern: 'yyyy-MM-dd.log',
    alwaysIncludePattern: true
}, {
    // env: app.env,
    level: 'info'
}));

app.use(function (ctx: any, next: Function) {
    return next().catch((err: any) => {
        if (401 === err.status) {
            ctx.status = 401;
            ctx.body = ctx;
            ctx.body = {status: 0, data: {msg: '请先登陆'}}
        } else {
            throw err;
        }
    });
});

// jwt验证
app.use(koaJwt({
    secret: JWT_SECRET
}).unless({
    path: [/\/api\/reg/, /\/api\/login/, /\/admin\/login/, /\/webSocket\/upload/, /^\/upload/],
}))

// 使用路由
app.use(router.routes())
app.ws.use(router.routes()).use(router.allowedMethods());

// 监听端口
app.listen(HTTP_PORT, () => {
    console.log("Server running on " + HTTP_HOST);
});

// 静态文件
serverStatic(router, {});

