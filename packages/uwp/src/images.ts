import * as  sharp from 'sharp';
import * as  path from 'path';

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

interface IImageSize {
    name : string;
    width : number;
    height? : number;
}

const images : IImageSize[] = [{
    name: 'Square44x44Logo.altform-unplated_targetsize-16',
    width: 16,
}, {
    name: 'Square44x44Logo.altform-unplated_targetsize-32',
    width: 32,
}, {
    name: 'Square44x44Logo.altform-unplated_targetsize-48',
    width: 48,
}, {
    name: 'Square44x44Logo.altform-unplated_targetsize-256',
    width: 256,
}, {
    name: 'storelogo',
    width: 50,
}, {
    name: 'LargeTile.scale-100',
    width: 310,
}, {
    name: 'LargeTile.scale-125',
    width: 388,
}, {
    name: 'LargeTile.scale-150',
    width: 465,
}, {
    name: 'LargeTile.scale-200',
    width: 620,
}, {
    name: 'LargeTile.scale-400',
    width: 1240,
}, {
    name: 'SmallTile.scale-100',
    width: 71,
}, {
    name: 'SmallTile.scale-125',
    width: 89,
}, {
    name: 'SmallTile.scale-150',
    width: 107,
}, {
    name: 'SmallTile.scale-200',
    width: 142,
}, {
    name: 'SmallTile.scale-400',
    width: 284,
}, {
    name: 'splashscreen.scale-100',
    width: 620,
    height: 300,
}, {
    name: 'splashscreen.scale-125',
    width: 775,
    height: 375,
}, {
    name: 'splashscreen.scale-150',
    width: 930,
    height: 450,
}, {
    name: 'splashscreen.scale-200',
    width: 1240,
    height: 600,
}, {
    name: 'splashscreen.scale-400',
    width: 2480,
    height: 1200,
}, {
    name: 'Square44x44Logo.scale-100',
    width: 44,
}, {
    name: 'Square44x44Logo.scale-125',
    width: 55,
}, {
    name: 'Square44x44Logo.scale-150',
    width: 66,
}, {
    name: 'Square44x44Logo.scale-200',
    width: 88,
}, {
    name: 'Square44x44Logo.scale-400',
    width: 176,
}, {
    name: 'Square150x150Logo.scale-100',
    width: 150,
}, {
    name: 'Square150x150Logo.scale-125',
    width: 188,
}, {
    name: 'Square150x150Logo.scale-150',
    width: 225,
}, {
    name: 'Square150x150Logo.scale-200',
    width: 300,
}, {
    name: 'Square150x150Logo.scale-400',
    width: 600,
}, {
    name: 'Wide310x150Logo.scale-100',
    width: 310,
    height: 150,
}, {
    name: 'Wide310x150Logo.scale-125',
    width: 388,
    height: 188,
}, {
    name: 'Wide310x150Logo.scale-150',
    width: 465,
    height: 225,
}, {
    name: 'Wide310x150Logo.scale-200',
    width: 620,
    height: 300,
}, {
    name: 'Wide310x150Logo.scale-400',
    width: 1240,
    height: 600,
}];

export function generateAllIcons(src : string, dest : string) {
    const tasks = images.map((img) => {
        return resizeImage(src, path.join(dest, `${img.name}.png`), img.width, img.height || img.width, { fit: 'contain' });
    });

    return Promise.all(tasks);
}
