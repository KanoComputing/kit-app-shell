const util = require('@kano/kit-app-shell-cordova/lib/util');
const path = require('path');
const Config = require('@kano/kit-app-shell-cordova/lib/cordova-config');
const icons = require('../../data/icons');
const screens = require('../../data/screens');

function getIconPath(key, projectPath) {
    return path.join(projectPath, 'res/icon/ios', key);
}

function generateIcons(src, projectPath) {
    const tasks = icons.map((icon) => {
        const { width } = icon;
        return util.resizeImage(src, getIconPath(icon.name, projectPath), width, width);
    });
    return Promise.all(tasks);
}

function getScreenPath(key, projectPath) {
    return path.join(projectPath, 'res/screen/ios', key);
}

function generateScreens(src, projectPath) {
    const tasks = screens.map((screen) => {
        const { width, height } = screen;
        const filePath = getScreenPath(screen.name, projectPath);
        return util.resizeImage(src, filePath, width, height);
    });
    return Promise.all(tasks);
}

module.exports = (context) => {
    const warnings = [];
    const tasks = [];
    // TODO: Check on every build the timestamp of the source icon to regenerate if necessary
    const { projectRoot, shell } = context.opts;
    if (!shell) {
        return;
    }
    shell.processState.setStep('Generating icons and splashcreens');
    const cfg = new Config(path.join(projectRoot, 'config.xml'));
    cfg.selectPlatform('ios');
    cfg.removeIcons();
    cfg.removeScreens();
    if (shell.config.ICONS && shell.config.ICONS.IOS) {
        const iconSrc = path.join(shell.app, shell.config.ICONS.IOS);
        tasks.push(generateIcons(iconSrc, projectRoot)
            .then(() => {
                icons.forEach((icon) => {
                    const src = getIconPath(icon.name, '');
                    cfg.addIcon({ width: icon.width, height: icon.width, src, });
                });
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
            warnings.forEach(w => shell.processState.setWarning(w));
            shell.processState.setSuccess('Icons and splashscreens generated');
        });
};
