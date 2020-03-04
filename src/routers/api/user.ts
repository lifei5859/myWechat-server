const Router = require('koa-router');                   // 引入路由模块

const router = new Router();                            // 声明router

import {checkDbRes} from '../../libs/checkDbRes'        // 引入检测数据库 返回值模块

// 获取用户信息
router.get('/getUserInfo', async (ctx: any) => {
    console.log('请求用户数据')
    const mail: string = ctx.req.headers['my-mail'];
    let res: any[] = await ctx.db(`select * from user_table where e_mail=?;`, [mail]);
    if (res.length > 0) {
        let userInfo = res[0];
        ctx.body = {status: 1, data: {msg: '获取用户信息成功', userInfo}};
        ctx.log.info()
    } else {
        ctx.status = 401;
        ctx.body = {status: 0, data: {msg: '用户信息错误'}};
        ctx.log.error();
    }
});

// 检测用户是否在线
router.get('/checkOnLine', async (ctx: any) => {
    console.log(ctx.query, '>>>>>>>>>>>>>>>>>>>');
    const {id} = ctx.query;
    const res: any[] = await ctx.db(`SELECT online FROM user_table WHERE id=?;`, [id]);

    const flag: string = checkDbRes(res);
    if (flag === 'err') {
        ctx.status = 500;
        ctx.body = {status: 0, data: {msg: '数据库错误'}}
        ctx.log.error();

    } else if (flag === 'none') {
        ctx.status = 500;
        ctx.body = {status: 0, data: {msg: '用户数据错误'}}
        ctx.log.error();

    } else {
        ctx.log.info();
        ctx.body = {status: 1, data: res[0]}
    }

})


export const user = router.routes();
