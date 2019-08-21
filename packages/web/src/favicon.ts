import * as path from 'path';
import { resizeImage } from './util';

export const faviconTemplate = `
    <!-- generics -->
    <link rel="icon" href="/favicon-32.png" sizes="32x32">
    <link rel="icon" href="/favicon-57.png" sizes="57x57">
    <link rel="icon" href="/favicon-76.png" sizes="76x76">
    <link rel="icon" href="/favicon-96.png" sizes="96x96">
    <link rel="icon" href="/favicon-128.png" sizes="128x128">
    <link rel="icon" href="/favicon-192.png" sizes="192x192">
    <link rel="icon" href="/favicon-228.png" sizes="228x228">

    <!-- Android -->
    <link rel="shortcut icon" sizes="196x196" href=“/favicon-196.png">

    <!-- iOS -->
    <link rel="apple-touch-icon" href="/favicon-120.png" sizes="120x120">
    <link rel="apple-touch-icon" href="/favicon-152.png" sizes="152x152">
    <link rel="apple-touch-icon" href="/favicon-180.png" sizes="180x180">
`;

/**
 * Uses sharp to resize a provided image into a fitted rectangle
 * @param {String} src Path to the source image
 * @param {String} out Path to the destination image
 * @param {Number} width Width of the destination image
 * @param {Number} height Height of the destination image
 * @param {{ fit: 'cover'|'contain'|'fill'|'inside'|'outside' }} opts Fitting options
 */
export function generateFavicons(
    src : string,
    out : string,
) : Promise<void[]> {
    const sizes = [32, 57, 76, 96, 120, 128, 152, 180, 192, 196, 228];
    const tasks = sizes.map((size) => {
        return resizeImage(src, path.join(out, `favicon-${size}.png`), size, size);
    });
    return Promise.all(tasks);
}