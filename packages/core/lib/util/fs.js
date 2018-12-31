const { promisify } = require('util');
const mkdirp = promisify(require('mkdirp'));
const fs = require('fs');
const path = require('path');
const replace = require('stream-replace');

/**
 * Promise version of file copy using streams
 * Allows to pass an optional transform stream
 * TODO: Use fs.copyFile is exists and no transform is required for speed improvements
 */
function _copy(src, dest, { transform = null, writeOptions } = {}) {
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

/**
 * Safely copies a file, creating the target directory if needed
 */
function copy(src, dest, opts) {
    const out = path.dirname(dest);
    return mkdirp(out)
        .then(() => _copy(src, dest, opts));
}

function fromTemplate(tmpPath, dest, options, writeOptions) {
    const transform = replace(/\$\{(.*?)\}/g, (match, g1) => options[g1] || '');
    return copy(tmpPath, dest, {
        transform,
        writeOptions,
    });
}

module.exports = {
    copy,
    fromTemplate,
};
