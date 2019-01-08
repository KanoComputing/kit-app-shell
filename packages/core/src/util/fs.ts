import * as fs from 'fs';
import * as path from 'path';
import * as replace from 'stream-replace';
import * as mkdirpCb from 'mkdirp';
import { promisify } from 'util';
import { Writable } from 'stream';

const mkdirp = promisify(mkdirpCb);

interface CopyOptions {
    transform? : Writable;
    writeOptions? : {};
}

/**
 * Promise version of file copy using streams
 * Allows to pass an optional transform stream
 * TODO: Use fs.copyFile is exists and no transform is required for speed improvements
 */
function _copy(src : string, dest : string, options : CopyOptions = {}) {
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

/**
 * Safely copies a file, creating the target directory if needed
 */
export function copy(src : string, dest : string, opts? : CopyOptions) {
    const out = path.dirname(dest);
    return mkdirp(out)
        .then(() => _copy(src, dest, opts));
}

export function fromTemplate(tmpPath : string, dest : string, options : {}, writeOptions? : {}) {
    const transform = replace(/\$\{(.*?)\}/g, (match, g1) => options[g1] || '');
    return copy(tmpPath, dest, {
        transform,
        writeOptions,
    });
}
