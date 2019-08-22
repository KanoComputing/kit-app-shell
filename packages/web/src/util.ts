import * as  sharp from 'sharp';

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