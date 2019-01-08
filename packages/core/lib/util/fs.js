"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const replace = require("stream-replace");
const mkdirpCb = require("mkdirp");
const util_1 = require("util");
const mkdirp = util_1.promisify(mkdirpCb);
function _copy(src, dest, options = {}) {
    const { transform = null, writeOptions = null } = options;
    return new Promise((resolve, reject) => {
        const read = fs.createReadStream(src);
        const write = fs.createWriteStream(dest, writeOptions);
        read.on('error', reject);
        write.on('error', reject);
        write.on('finish', () => {
            resolve();
        });
        if (transform) {
            transform.on('error', reject);
            read.pipe(transform).pipe(write);
            return;
        }
        read.pipe(write);
    });
}
function copy(src, dest, opts) {
    const out = path.dirname(dest);
    return mkdirp(out)
        .then(() => _copy(src, dest, opts));
}
exports.copy = copy;
function fromTemplate(tmpPath, dest, options, writeOptions) {
    const transform = replace(/\$\{(.*?)\}/g, (match, g1) => options[g1] || '');
    return copy(tmpPath, dest, {
        transform,
        writeOptions,
    });
}
exports.fromTemplate = fromTemplate;
//# sourceMappingURL=fs.js.map