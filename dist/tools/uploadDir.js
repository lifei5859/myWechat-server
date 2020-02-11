"use strict";
const { HTTP_UPLOAD } = require('../config');
const moment = require('moment');
module.exports = function dir() {
    let time = moment().format('YYYY-MM-DD');
    return `${HTTP_UPLOAD}_${time}`;
};
//# sourceMappingURL=uploadDir.js.map