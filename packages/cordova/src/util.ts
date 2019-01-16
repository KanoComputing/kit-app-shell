import * as path from 'path';
import * as  sharp from 'sharp';

/**
 * Resolve the location of a module by resolving its package.json
 */
export function getModulePath(name : string) : string {
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
export function resizeImage(
    src : string,
    out : string,
    width : number,
    height : number,
    { fit = 'cover' } = {},
) : Promise<void> {
    return sharp(src)
        .resize({ width, height, fit })
        .toFile(out);
}
