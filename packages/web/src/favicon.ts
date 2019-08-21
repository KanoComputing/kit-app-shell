import * as path from 'path';
import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import { IKashConfig } from '@kano/kit-app-shell-core/lib/types';
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
 * Generates the various favicon image assets based of a single png
 * @param {Object} config The app config object
 * @param {String} out Path to the destination image
 */
export function generateFavicons(
    config : IKashConfig,
    out : string,
    basePath: string,
) : Promise<void[]> {
    if (!('FAVICON' in config.ICONS)) {
        processState.setWarning('Favicon path not provided in app config');
        return Promise.all([]);
    }

    const src = path.join(basePath, config.ICONS.FAVICON);
    const sizes = [32, 57, 76, 96, 120, 128, 152, 180, 192, 196, 228];
    const tasks = sizes.map((size) => {
        return resizeImage(src, path.join(out, `favicon-${size}.png`), size, size);
    });
    return Promise.all(tasks);
}