import * as path from 'path';
import * as  sharp from 'sharp';

/**
 * Resolve the location of a module by resolving its package.json
 */
export function getModulePath(name) {
    return path.dirname(require.resolve(`${name}/package.json`));
}

/**
 * Uses sharp to resize a provided image into a fitted rectangle
 * @param {String} src Path to the source image
 * @param {String} out Path to the destination image
 * @param {Number} width Width of the destination image
 * @param {Number} height Height of the destination image
 * @param {{ fit: 'cover'|'contain'|'fill'|'inside'|'outside' }} opts Fitting options
 */
export function resizeImage(src, out, width, height, { fit = 'cover' } = {}) {
    return sharp(src)
        .resize({ width, height, fit })
        .toFile(out);
}
