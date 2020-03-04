const Router = require('koa-router');               // 引入路由模块
const fs = require('fs');                           // 读取文件模块
const path = require('path');                       // 路径模块
// const jwt = require('jsonwebtoken');                // 生成token模块
// const uuid = require('uuid');                       // 生成随机id
// const utility = require("utility");                 // 引入加密模块
// const pinyin = require('node-pinyin');              // 引入汉字转拼音模块

import config from '../../config';                  // 引入配置文件
const {JWT_SECRET, PASS_SUFFIX} = config;           // 声明jwt key 和 pass 加盐
const router = new Router();                        // 声明router

router.get('/login', async (ctx: any) => {
    console.log('ctx.req.url')
    let data = fs.readFileSync(path.resolve(__dirname, './admin.json'));
    console.log(JSON.parse(data.toString()))
    ctx.body = JSON.parse(data.toString())
})

// 倒出路由
export const admin = router.routes();
