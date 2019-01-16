import * as path from 'path';
import * as sharp from 'sharp';
import { promisify } from 'util';
import * as rimrafCb from 'rimraf';

const rimraf = promisify(rimrafCb);

export const icons = {
    Square44x44Logo: [44, 44],
    Square50x50Logo: [50, 50],
    Square150x150Logo: [150, 150],
    Wide310x150Logo: [310, 150],
    Square310x310Logo: [310, 310],
    Square71x71Logo: [71, 71],
};

const defaultIcons = [
    'SampleAppx.44x44.png',
    'SampleAppx.50x50.png',
    'SampleAppx.150x150.png',
    'SampleAppx.310x150.png',
];

const DEFAULT_BACKGROUND = { r: 0, g: 0, b: 0, alpha: 0 };

function getAssetsPath(root : string) : string {
    return path.join(root, 'assets');
}

export function deleteDefaultIcons(root : string) : Promise<void> {
    const assetsPath : string = getAssetsPath(root);
    return defaultIcons.reduce<Promise<void>>((p, defaultIcon) => {
        return p.then(() => rimraf(path.join(assetsPath, defaultIcon)));
    }, Promise.resolve());
}

export function filenameFromIconKey(key : string) : string {
    return `${key}.png`;
}

export function generateIcons(root : string, src : string) : Promise<null> {
    const assetsPath : string = getAssetsPath(root);
    const tasks = Object.keys(icons).map<Promise<void>>((key : string) => {
        const [width, height] = icons[key];
        return sharp(src)
            .resize({ width, height, fit: 'contain', background: DEFAULT_BACKGROUND })
            .toFile(path.join(assetsPath, filenameFromIconKey(key)));
    });
    return Promise.all(tasks).then(() => null);
}
