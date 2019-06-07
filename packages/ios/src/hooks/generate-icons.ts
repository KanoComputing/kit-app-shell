import { resizeImage } from '@kano/kit-app-shell-cordova/lib/util';
import * as path from 'path';
import { CordovaConfig } from '@kano/kit-app-shell-cordova/lib/cordova-config';
import * as sharp from 'sharp';
// tslint:disable-next-line:no-var-requires
const icons = require('../../data/icons');
// tslint:disable-next-line:no-var-requires
const screens = require('../../data/screens');

function getIconPath(key, projectPath) {
    return path.join(projectPath, 'res/icon/ios', key);
}

function generateIcons(src, projectPath) {
    return icons.reduce((acc, icon) => {
        const { width } = icon;
        return acc.then(() => resizeImage(src, getIconPath(icon.name, projectPath), width, width));
    }, Promise.resolve());
}

function getScreenPath(key, projectPath) {
    return path.join(projectPath, 'res/screen/ios', key);
}

function generateScreens(src, projectPath) {
    const tasks = screens.map((screen) => {
        const { width, height } = screen;
        const filePath = getScreenPath(screen.name, projectPath);
        return resizeImage(src, filePath, width, height);
    });
    return Promise.all(tasks);
}

function generateStoreIcon(src : string, projectPath : string) {
    return sharp(src)
        .resize({ width: 1024, height: 1024})
        .removeAlpha()
        .toFile(getIconPath('store-icon.png', projectPath));
}

export = (context) => {
    const warnings = [];
    const tasks = [];
    // TODO: Check on every build the timestamp of the source icon to regenerate if necessary
    const { projectRoot, shell } = context.opts;
    if (!shell) {
        return null;
    }
    shell.processState.setStep('Generating icons and splashcreens');
    const cfg = new CordovaConfig(path.join(projectRoot, 'config.xml'));
    cfg.selectPlatform('ios');
    cfg.removeIcons();
    cfg.removeScreens();
    if (shell.config.ICONS && shell.config.ICONS.IOS) {
        const iconSrc = path.join(shell.app, shell.config.ICONS.IOS);
        tasks.push(generateIcons(iconSrc, projectRoot)
            .then(() => generateStoreIcon(iconSrc, projectRoot))
            .then(() => {
                icons.forEach((icon) => {
                    const src = getIconPath(icon.name, '');
                    cfg.addIcon({ width: icon.width, height: icon.width, src });
                });
                cfg.addIcon({ width: 1024, height: 1024, src: getIconPath('store-icon.png', '') });
            }));
    } else {
        warnings.push('No iOS icon defined in the config');
    }
    if (shell.config.SPLASHSCREENS && shell.config.SPLASHSCREENS.IOS) {
        const screenSrc = path.join(shell.app, shell.config.SPLASHSCREENS.IOS);
        tasks.push(generateScreens(screenSrc, projectRoot)
            .then(() => {
                screens.forEach((screen) => {
                    cfg.addScreen({
                        width: screen.width,
                        height: screen.height,
                        src: getScreenPath(screen.name, ''),
                    });
                });
            }));
    } else {
        warnings.push('No iOS splashscreen defined in the config');
    }
    return Promise.all(tasks)
        .then(() => cfg.write())
        .then(() => {
            warnings.forEach((w) => shell.processState.setWarning(w));
            shell.processState.setSuccess('Icons and splashscreens generated');
        });
};
