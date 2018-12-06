const path = require('path');
const sharp = require('sharp');

function getModulePath(name) {
    return path.dirname(require.resolve(`${name}/package.json`));
}

function resizeImage(src, out, width, height, { fit = 'cover' } = {}) {
    return sharp(src)
        .resize({ width, height, fit })
        .toFile(out);
}

module.exports = {
    getModulePath,
    resizeImage,
};
