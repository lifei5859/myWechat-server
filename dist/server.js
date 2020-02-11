"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require('koa'); // 导入koa
const Router = require('koa-router'); // 导入koa-router
const { api } = require('./routers/api');
const config_1 = require("./config");
const { HTTP_HOST, HTTP_PORT } = config_1.default;
const app = new Koa(); // 新建一个Koa对象
const router = new Router(); // 新建一个koa-router对象
router.get('/', async (ctx) => {
    ctx.body = "Hello Koa and TS,I am keysking."; // 向浏览器返回数据
});
router.use('/api', api);
app.use(router.routes()); // 使用路由
app.listen(HTTP_PORT, () => {
    console.log("Server running on " + HTTP_HOST);
});
//# sourceMappingURL=server.js.map