const Router = require('koa-router');               // 引入路由模块
const jwt = require('jsonwebtoken');                // 生成token模块
const uuid = require('uuid');                       // 生成随机id
const utility = require("utility");                 // 引入加密模块

import config from '../../config';                  // 引入配置文件
import {user} from './user';                        // 引入/user路由

const {JWT_SECRET, PASS_SUFFIX} = config;           // 声明jwt key 和 pass 加盐
const router = new Router();                        // 声明router

// 注册账户
router.post('/reg', async (ctx: any) => {
    let {username, mail, pass} = ctx.request.fields;
    const password: string = utility.md5(`${pass}${PASS_SUFFIX}`);
    const userId: string = uuid.v1();
    let res: any[] = await ctx.db(`select * from user_table where user_name=? or id=? or e_mail=?`, [username, userId, mail]);

    if (res.length > 0) {
        ctx.body = {status: 0, data: {msg: '昵称或邮箱已存在'}};
    } else {
        let data: any = await ctx.db(`insert into user_table (id, user_name, e_mail, pass) values (?,?,?,?);`, [userId, username, mail, password]);
        if (data.errno) {
            ctx.status = 500;
            ctx.body = {status: 0, data: {msg: '数据库错误', sqlMessage: data.sqlMessage}};
        } else {
            ctx.body = {status: 1, data: {msg: '注册成功'}};
        }
    }

});

// 用户登陆
router.post('/login', async (ctx: any) => {
    const {mail, pass} = ctx.request.fields;
    let res: any[] = await ctx.db(`select * from user_table where e_mail=?;`, [mail]);
    if (res.length > 0) {
        const password: string = utility.md5(`${pass}${PASS_SUFFIX}`);
        const {pass: password1} = res[0];
        if (password1 === password) {
            let token: string = jwt.sign({
                exp: Math.floor(Date.now() / 1000) + (60),
                data: mail
            }, JWT_SECRET);
            ctx.body = {status: 1, data: {token: token, msg: '登陆成功'}};
        } else {
            ctx.body = {status: 0, data: {msg: '用户名或密码错误'}};
        }
    } else {
        ctx.body = {status: 0, data: {msg: '用户名或密码错误'}};
    }
});

// 使用/user 路由
router.use('/user', user);

// 倒出路由
export const api = router.routes();
