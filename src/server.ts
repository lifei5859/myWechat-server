const Koa = require('koa');                           // 导入koa
const Router = require('koa-router');                 // 导入koa-router
const body = require('koa-better-body');              // post解析
const koaJwt = require('koa-jwt');                    // koa监控token
const {api} = require('./routers/api');               // /api路由模块
const jwt = require('jsonwebtoken');                  // 生成token
const serverStatic = require('./routers/static');     // 静态文件模块

import {genToken} from './libs/jwtToken';             // 解析token
import config from './config';                        // 倒入配置文件
import {createCoon} from './libs/database';           // mysql模块

const {HTTP_HOST, HTTP_PORT, HTTP_UPLOAD, JWT_SECRET} = config;
const app = new Koa();                                // 新建一个Koa对象
const router = new Router();                          // 新建一个koa-router对象

app.context.db = createCoon;                          // mysql方法挂载到上下文

// jwt验证
app.use(koaJwt({
    secret: JWT_SECRET
}).unless({
    path: [/\/api\/reg/, /\/api\/login/],
}))

// 当token快失效时有请求发来 更新token
app.use(async (ctx: any, next: Function) => {
    const user: string = ctx.req.headers['my-mail'];
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

// 上传目录
app.use(body({uploadDir: HTTP_UPLOAD}));

app.use(function (ctx: any, next: Function) {
    return next().catch((err: any) => {
        if (401 == err.status) {
            ctx.status = 401;
            ctx.body = {status: 0, data: {msg: '请先登陆'}}
        } else {
            throw err;
        }
    });
});

// 使用路由
app.use(router.routes());

// 监听端口
app.listen(HTTP_PORT, () => {
    console.log("Server running on " + HTTP_HOST);
});

// 静态文件
serverStatic(router, {});

