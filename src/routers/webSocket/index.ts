const Router = require('koa-router');                   // 引入路由模块
const uuid = require('uuid');                           // 生成随机id
import {checkDbRes} from '../../libs/checkDbRes'
const router = new Router();                            // 声明router


const ADD_FRIEND_TYPE: string = 'addFriend';
const AGREE_ADD_TYPE: string = 'agreeAdd';
const COMMON_MGS_TYPE: string = 'commonMsg';

function transformStr(str: string): string {
    const reg = /_(\w)/g;
    return str.replace(reg, function ($0: string, $1: string): string {
        return $1.toUpperCase();
    })
}


type MSG = {
    type: string
    message: string
    targetId: string
    originId: string
    [name: string]: any
}

type SendMsg = {
    type: string
    message: string
    originId: string
}

type MsgByDb = {
    targetId: string
    originId: string
    message: string
    cTime: number
    type: string
    processed?: number
    id?: number,
    file?: string | undefined
}


let socketArr: any[] = [];
// 没在线 信息处理    也许不需要
// async function notOnline(ctx: any, resMsg: MSG, socketArr: any[]) {
//     console.log('notOnline')
//     const notOnlineMsg: MsgByDb = {
//         targetId: resMsg.targetId,
//         originId: resMsg.originId,
//         message: resMsg.message,
//         cTime: Date.now(),
//         type: resMsg.type,
//         processed: 0
//     };
//     const {targetId, originId, message, cTime, type, processed} = notOnlineMsg;
//     console.log(notOnlineMsg, '消息数据')
//     const notOnlineMsgDB = await ctx.db(`INSERT INTO message_table (origin_id, target_id, message, type, c_time, processed) VALUES (?, ?, ?, ?, ?, ?);`, [originId, targetId, message, type, cTime, processed]);
//     console.log(notOnlineMsgDB)
//     if (notOnlineMsgDB.errno) {
//         socketArr.forEach(item => {
//             if (item.socket === ctx.websocket) {
//                 ctx.websocket.send(JSON.stringify({status: 0, data: {msg: '数据库错误'}}));
//             }
//         })
//     }
// }

// 添加好友信息处理
async function addFriendMsg(ctx: any, resMsg: MSG, socketArr: any[]) {
    const Msg: MsgByDb = {
        targetId: resMsg.targetId,
        originId: resMsg.originId,
        message: resMsg.message,
        cTime: Date.now(),
        type: resMsg.type,
        processed: 0,
        file: resMsg.file
    };
    // 向用户发送消息 并把消息数据储存到数据库
    const {targetId, originId, message, cTime, type, processed, file} = Msg;
    const isInsertDb: any = await ctx.db(`INSERT INTO message_table (origin_id, target_id, message, type, c_time, processed, file) VALUES (?, ?, ?, ?, ?, ?, ?);`, [originId, targetId, message, type, cTime, processed, file]);
    await ctx.db(`INSERT INTO friend_list (id, user_id, friend_id, relation, is_ok) VALUES (?, ?, ?, ?, ?);`, [uuid.v1(), originId, targetId, 'common', 0])
    socketArr.forEach(async item => {
        if (item.key === resMsg.targetId) {
            console.log(item.key)
            if (checkDbRes(isInsertDb) === 'err') {
                console.log(isInsertDb)
            }
            item.socket.send(JSON.stringify([Msg]));
        }
    });
}

// 同意添加好友
async function agreeAdd(ctx: any, resMsg: MSG, socketArr: any[]) {
    console.log(resMsg)
    const Msg = {
        targetId: resMsg.targetId,
        originId: resMsg.originId,
        message: resMsg.message,
        cTime: Date.now(),
        type: resMsg.type
    }
    const {targetId, originId, message, cTime} = Msg;
    let res: any;
    if (message === 'ok') {
        res = await ctx.db(`UPDATE friend_list SET is_ok=1 WHERE friend_id=? AND user_id=?;`, [targetId, originId])
        console.log(res)
    } else {
        res = await ctx.db(`UPDATE friend_list SET is_ok=-1 WHERE friend_id=? AND user_id=?;`, [targetId, originId])
    }
    if (checkDbRes(res) === 'err') {
        ctx.websocket.send(JSON.stringify({status: 0, data: {msg: '数据库错误'}}));
    } else {
            await commonMsg(ctx, {
                targetId: originId,
                originId: targetId,
                cTime,
                type: COMMON_MGS_TYPE,
                message: '你们已经是好友'
            }, socketArr)

            await commonMsg(ctx, {
                targetId,
                originId,
                cTime,
                type: COMMON_MGS_TYPE,
                message: '你们已经是好友'
            }, socketArr)
    }
}

// 普通消息处理  耦合后期看看是否重写
async function commonMsg(ctx: any, resMsg: MSG, socketArr: any[]) {
    const Msg: MsgByDb = {
        targetId: resMsg.targetId,
        originId: resMsg.originId,
        message: resMsg.message,
        cTime: Date.now(),
        type: resMsg.type,
        processed: 0,
        file: resMsg.file
    };
    // 向用户发送消息 并把消息数据储存到数据库
    const {targetId, originId, message, cTime, type, processed, file} = Msg;
    console.log(message)
    const isInsertDb: any = await ctx.db(`INSERT INTO message_table (origin_id, target_id, message, type, c_time, processed, file) VALUES (?, ?, ?, ?, ?, ?, ?);`, [originId, targetId, message, type, cTime, processed, file]);
    socketArr.forEach(async item => {
        if (item.key === resMsg.targetId) {
            console.log(item.key)
            if (checkDbRes(isInsertDb) === 'err') {
                console.log(isInsertDb)
            }
            item.socket.send(JSON.stringify([Msg]));
        }
    });
}


router.all('/', async (ctx: any) => {
    const {userId} = ctx.query;
    console.log(userId, '---------');
    const res: any = await ctx.db('UPDATE user_table SET online=1 WHERE id=?;', [userId]);
    if (checkDbRes(res) === 'err') {
        ctx.websocket.send(JSON.stringify({status: 0, data: {msg: '数据库错误'}}));
    }
    // let keyFlag: boolean = socketArr.some(item => item.key === userId)
    // console.log(keyFlag)
    // if(keyFlag) return
    socketArr.push({key: userId, socket: ctx.websocket});
    ctx.websocket.send(JSON.stringify({status: 1, data: {msg: '连接成功'}}));
    ctx.websocket.on('message', async (msg: string) => {
        const resMsg: MSG = JSON.parse(msg);
        switch (resMsg.type) {
            case ADD_FRIEND_TYPE:
                await addFriendMsg(ctx, resMsg, socketArr)
                break;
            case AGREE_ADD_TYPE:
                await agreeAdd(ctx, resMsg, socketArr)
                break;
            case COMMON_MGS_TYPE:
                await commonMsg(ctx, resMsg, socketArr)
                break;
            default:
                break;
        }
        // const targetOnline = socketArr.some(item => item.key === resMsg.targetId);
        // if (!targetOnline) {
        //     await notOnline(ctx, resMsg, socketArr);
        //     return
        // }
        // // 向用户发送消息 并把消息数据储存到数据库
        // const onlineMsg: MsgByDb = {
        //     targetId: resMsg.targetId,
        //     originId: resMsg.originId,
        //     message: resMsg.message,
        //     cTime: Date.now(),
        //     type: resMsg.type,
        //     processed: 0
        // };
        // const {targetId, originId, message, cTime, type, processed} = onlineMsg;
        // const isInsertDb: any = await ctx.db(`INSERT INTO message_table (origin_id, target_id, message, type, c_time, processed) VALUES (?, ?, ?, ?, ?, ?);`, [originId, targetId, message, type, cTime, processed]);
        // socketArr.forEach(async item => {
        //     if (item.key === resMsg.targetId) {
        //         console.log(item.key)
        //         if(onlineMsg.type === 'addFriend') {
        //             await ctx.db(`INSERT INTO friend_list (id, user_id, friend_id, relation, is_ok) VALUES (?, ?, ?, ?, ?);`, [uuid.v1(), originId, targetId, 'common', 0])
        //         }
        //
        //         if (checkDbRes(isInsertDb) === 'err') {
        //             console.log(isInsertDb)
        //         }
        //         item.socket.send(JSON.stringify([onlineMsg]));
        //     }
        // })
    });
    // 断开socket连接
    ctx.websocket.on('close', async () => {
        socketArr.filter(async item => {
            console.log('断开了')
            if (item.socket === ctx.websocket) {
                console.log(`${item.key} 断开了`)
                await ctx.db('UPDATE user_table SET online=0 WHERE id=?;', item.key);
            }
            return item.socket !== ctx.websocket;
        });
    });
    ctx.log.info();
});
// 获取普通消息  与获取好友 耦合 后期需优化
async function getCommonMsgList<T>(ctx: any, option: {userId: string, pageSize: number, page: number, friendId: string | undefined}): Promise<Array<T>> {
    // console.log(option, '消息请求')
    let friendIdList: string[];

    if(option.friendId) {
        friendIdList = [option.friendId]
    } else {
        let res1: any[] = await ctx.db(`SELECT friend_id FROM friend_list WHERE is_ok=1 AND user_id=?;`, [option.userId]);
        let res2: any[] = await ctx.db(`SELECT user_id FROM friend_list WHERE is_ok=1 AND friend_id=?;`, [option.userId]);
        let friendIds: string[] = res1.map((item: any) => item['friend_id']);
        let userIds: string[] = res2.map((item: any) => item['user_id']);
        friendIdList = friendIds.concat(userIds);
    }
    console.log(friendIdList)
    let commonMsgList: T[] = [];
    for (let i = 0; i < friendIdList.length; i++) {
        const res = await ctx.db(`SELECT * FROM message_table WHERE type='commonMsg' AND (target_id=? AND origin_id=?) OR (origin_id=? AND target_id=?) ORDER BY c_time DESC LIMIT ?,? ;`, [friendIdList[i],option.userId, friendIdList[i],option.userId, option.page, option.pageSize]);
        // console.log(res)
        commonMsgList = [...commonMsgList, ...res]
    }
    console.log(commonMsgList.length)
    return commonMsgList
}

// 程序加载成功 首次 获取消息
router.post('/getMessage', async (ctx: any) => {
    console.log(ctx.request.fields, '请求信息')
    const {page, pageSize, targetId, type, friendId} = ctx.request.body;
    let res: any[] = [];
    if(type !== 'commonMsg') res = await ctx.db(`SELECT * FROM message_table WHERE type='addFriend' and target_id=? LIMIT ?,?;`, [targetId, page, pageSize]);
    const commonMsgList: any[] = await getCommonMsgList<any>(ctx, {userId: targetId, pageSize, page, friendId})
    // console.log(commonMsgList)
    const flag = checkDbRes(res);
    if (flag === 'err') {
        ctx.status = 500;
        ctx.body = {status: 0, data: {msg: '数据库错误'}};
        ctx.log.error();
        return
    }
    const MsgList = [...res, ...commonMsgList]
    const sendMsg: MsgByDb[] = MsgList.map((item: any) => {
        const tempObj: any = {};
        for (let prop in item) {
            let tempStr: string;
            if (prop.indexOf('_') !== -1) {
                tempStr = transformStr(prop);
            } else {
                tempStr = prop
            }
            tempObj[tempStr] = item[prop]
        }
        return tempObj
    });
    console.log()
    ctx.body = {status: 1, data: {res: sendMsg}};
    ctx.log.info();
});

// 未处理信息数
router.get('/getMsgCount', async (ctx: any) => {
    console.log(ctx.query, '1233453465456')
    const {id, type} = ctx.query
    const res: any[] = await ctx.db(`SELECT count(*) as count FROM message_table WHERE target_id=? and processed=0 and type=?;`, [id, type]);
    console.log(res)
    ctx.body = {status: 1, data: res[0]}
});

router.get('/setMsgProcessed', async (ctx: any) => {
    console.log(ctx.query);
    const {targetId, originId, type} = ctx.query
    if(originId === 'undefined' || !originId) {
        const res: any = await ctx.db(`UPDATE message_table SET processed=1 WHERE processed=0 AND type=? AND target_id=?;`, [type, targetId]);
        console.log(res)
    } else {
        await ctx.db(`UPDATE message_table SET processed=1 WHERE type=? AND origin_id=? AND target_id=?;`, [type, originId, targetId]);
    }
    ctx.body = {status: 1, data: {msg: '状态已更新'}}
});

// 音频文件上传

router.post('/upload', async (ctx: any) => {
    console.log('aaaaaaaa')
   console.log(ctx.file, ctx.request.files, ctx.request.body)
});
// router.all('/upload', async (ctx: any) => {
//     console.log('aaaaaaa')
// })

export const io = router.routes();
