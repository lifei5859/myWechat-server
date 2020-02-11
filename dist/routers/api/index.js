"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require('koa-router');
const router = new Router();
const database_1 = require("../../libs/database");
console.log(database_1.createCoon);
router.get('/', (ctx) => {
    console.log(ctx.query);
    ctx.body = 'qweqweqwe';
});
router.post('/', (ctx) => {
    console.log(ctx.res.body);
});
router.get('/test', (ctx) => {
    console.dir(ctx.query);
    ctx.body = { status: 1, data: [
            { name: 'oldDeng', age: 88, sex: '男', id: 1 },
            { name: 'shanshan', age: 18, sex: '女', id: 2 },
            { name: 'cheng', age: 28, sex: '男', id: 3 }
        ] };
});
router.get('/getUser', async (ctx) => {
    const data = await database_1.createCoon.query('SELECT * FROM test_data');
    console.dir(data);
    ctx.body = 'ok';
});
console.log(router.routes());
exports.api = router.routes();
//# sourceMappingURL=index.js.map