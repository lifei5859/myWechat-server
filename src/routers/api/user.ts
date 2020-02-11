const Router = require('koa-router');                   // 引入路由模块

const router = new Router();                            // 声明router

// 获取用户信息
router.get('/getUserInfo', async (ctx: any) => {
    const mail: string = ctx.req.headers['my-mail'];
    let res: any[] = await ctx.db(`select * from user_table where e_mail=?;`, [mail]);
    console.log(res);
    if (res.length > 0) {
        let userInfo = res[0];
        ctx.body = {status: 1, data: {msg: '获取用户信息成功', userInfo}};
    } else {
        ctx.status = 401;
        ctx.body = {status: 0, data: {msg: '用户信息错误'}};
    }
});

export const user = router.routes();
