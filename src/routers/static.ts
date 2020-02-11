const myStatic = require('koa-static');

import config from '../config';
const {HTTP_STATIC} = config;

module.exports = function (router: any, options: any) {
    options = options || {};
    options.image = options.image || 30;
    options.html = options.html || 30;
    options.style = options.style || 30;
    options.script = options.script || 1;
    options.other = options.other || 7; 

    router.all(/((\.jpg)|(\.png)|(\.gif))$/i, myStatic(HTTP_STATIC, {
        maxAge: options.image * 86400 * 1000
    }));
    router.all(/((\.html)|(\.htm))$/i, myStatic(HTTP_STATIC, {
        maxAge: options.html * 86400 * 1000
    }));
    router.all(/(\.css)$/i, myStatic(HTTP_STATIC, {
        maxAge: options.style * 86400 * 1000
    }));
    router.all(/((\.js)|(\.jsx))$/i, myStatic(HTTP_STATIC, {
        maxAge: options.script * 86400 * 1000
    }));
    router.all('*', myStatic(HTTP_STATIC, {
        maxAge: options.other * 86400 * 1000
    }));
}
