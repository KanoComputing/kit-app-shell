"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("./logging");
const { DEBUG } = process.env;
function noop() { }
exports.log = {
    trace: DEBUG ? logging_1.logging.log : noop,
    debug: DEBUG ? logging_1.logging.log : noop,
    info: logging_1.logging.log,
    warn: logging_1.logging.warn,
    error: logging_1.logging.error,
};
//# sourceMappingURL=log.js.map