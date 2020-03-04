const Router = require('koa-router');                   // 引入路由模块

const router = new Router();                            // 声明router

// import {io} from '../../init'                               // 引入webSocket
// 获取好友列表
router.get('/getFriendList', async (ctx: any) => {
    const {id} = ctx.query;
    let res1: any[] = await ctx.db(`SELECT friend_id FROM friend_list WHERE is_ok=1 AND user_id=?;`, [id]);
    let res2: any[] = await ctx.db(`SELECT user_id FROM friend_list WHERE is_ok=1 AND friend_id=?;`, [id]);
    let friendIds: string[] = res1.map((item: any) => item['friend_id']);
    let userIds: string[] = res2.map((item: any) => item['user_id']);
    let friendIdList: string[] = friendIds.concat(userIds);
    let sendMsg: any[] = [];
    for (let i = 0; i < friendIdList.length; i++) {
        const res = await ctx.db('SELECT id,user_name,user_head,e_mail,spell,initial FROM user_table WHERE id=?;', [friendIdList[i]]);
        sendMsg.push(res[0]);
    }
    ctx.body = {status: 1, friendList: sendMsg}
});


router.get('/getFriendInfo', async (ctx: any) => {
    let {id} = ctx.query;
    console.log(id)
    let res: any[] = await ctx.db(`select id,user_name,user_head,e_mail from  user_table where id=?;`, [id]);
    if (res.length === 0) {
        ctx.status = 500;
        ctx.body = {status: 0, data: {msg: '用户信息错误'}};
        ctx.log.error();
    } else {
        ctx.body = {status: 1, data: {msg: '获取用户信息成功', friendInfo: res[0]}};
        ctx.log.info();
    }
})

router.get('/searchUser', async (ctx: any) => {
    const {keyword} = ctx.query;
    let res: any[] = await ctx.db(`select id,user_name,user_head,e_mail from  user_table where user_name like ? or e_mail like ?;`, [`%${keyword}%`, `%${keyword}%`]);
    console.log(res, res.length)
    if (res.length > 0) {
        ctx.body = {status: 1,  data: res};
        ctx.log.info();
    } else {
        ctx.status = 404;
        ctx.body = {status: 0, data: false};
        ctx.log.error();
    }
});
// //
// router.get('/addFriend', async (ctx: any) => {
//     const {id, mail} = ctx.query;
//     let userInfo: any[] = await ctx.db(`select e_mail from user_table where id=?;`, [userId]);
//     if (userInfo.length === 0) {
//         ctx.body = {status: 0, data: {msg: '用户不存在！'}};
//     } else {
//         let res: any = await ctx.bd(`insert into friend_list (id, user_mail, friend_list) values (?,?,?,?,?,?,?);`)
//         let updateRes: any = await ctx.db(`UPDATE t_emp SET friend_list=friend_list+? WHERE user_mail=?;`, [id, mail])
//     }
//
// });

export const friends = router.routes();
