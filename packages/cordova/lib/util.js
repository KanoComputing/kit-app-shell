"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const sharp = require("sharp");
function getModulePath(name) {
    return path.dirname(require.resolve(`${name}/package.json`));
}
exports.getModulePath = getModulePath;
function resizeImage(src, out, width, height, { fit = 'cover' } = {}) {
    return sharp(src)
        .resize({ width, height, fit })
        .toFile(out);
}
exports.resizeImage = resizeImage;
//# sourceMappingURL=util.js.map