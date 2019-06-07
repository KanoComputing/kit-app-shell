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

const sizes : { [K : string] : [number, number] } = {
    SMALL_TILE: [71, 71],
    MEDIUM_TILE: [150, 150],
    WIDE_TILE: [310, 150],
    LARGE_TILE: [310, 310],
    APP_ICON: [44, 44],
    SPLASH_SCREEN: [620, 300],
    BADGE_LOGO: [24, 24],
    PACKAGE_LOGO: [50, 50],
};

const iconGroups : { [K : string] : string } = {
    SMALL_TILE: 'SmallTile',
    MEDIUM_TILE: 'Square150x150Logo',
    WIDE_TILE: 'Wide310x150Logo',
    LARGE_TILE: 'LargeTile',
    APP_ICON: 'Square44x44Logo',
    SPLASH_SCREEN: 'splashscreen',
    BADGE_LOGO: 'BadgeLogo',
    PACKAGE_LOGO: 'storelogo',
};

const scales = [100, 125, 150, 200, 400];

const DEFAULT_BACKGROUND = { r: 0, g: 0, b: 0, alpha: 0 };

export function deleteDefaultIcons(assetsPath : string) : Promise<void> {
    return defaultIcons.reduce<Promise<void>>((p, defaultIcon) => {
        return p.then(() => rimraf(path.join(assetsPath, defaultIcon)));
    }, Promise.resolve());
}

export function filenameFromIconKey(key : string) : string {
    return `${iconGroups[key]}.png`;
}

export function getFilenameForIconWithScale(key : string, scale : number) {
    return `${iconGroups[key]}.scale-${scale}.png`;
}

function getScaledSize(size : number, scale : number) {
    return Math.round(size * scale / 100);
}

export function generateIcons(assetsPath : string, app : string, icon : string, config : { [K : string] : string }) : Promise<null> {
    // Generate all types of icons
    const tasks = Object.keys(iconGroups).map((key : string) => {
        const [width, height] = sizes[key];
        // Get either the default source icon or the custom icon type
        const src = path.join(app, config[key] || icon);
        // Each icon type must export its scaled versions
        return sharp(src)
            .resize({
                width,
                height,
                fit: 'contain',
                background: DEFAULT_BACKGROUND,
            })
            .toFile(path.join(assetsPath, filenameFromIconKey(key)));
    });
    return Promise.all(tasks).then(() => null);
}

export function generateIconsWithScale(assetsPath : string, app : string, icon : string, config : { [K : string] : string }) : Promise<null> {
    // Generate all types of icons
    const tasks = Object.keys(iconGroups).map((key : string) => {
        const [width, height] = sizes[key];
        // Get either the default source icon or the custom icon type
        const src = path.join(app, config[key] || icon);
        // Each icon type must export its scaled versions
        return Promise.all(scales.map((scale) => {
            return sharp(src)
                .resize({
                    width: getScaledSize(width, scale),
                    height: getScaledSize(height, scale),
                    fit: 'contain',
                    background: DEFAULT_BACKGROUND,
                })
                .toFile(path.join(assetsPath, getFilenameForIconWithScale(key, scale)));
        }));
    });
    return Promise.all(tasks).then(() => null);
}