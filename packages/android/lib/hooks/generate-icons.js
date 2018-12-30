const util = require('@kano/kit-app-shell-cordova/lib/util');
const Config = require('@kano/kit-app-shell-cordova/lib/cordova-config');
const path = require('path');
const icons = require('../../data/icons');
const screens = require('../../data/screens');

function getIconPath(key, projectPath) {
    return path.join(projectPath, 'res/icon/android', `${key}-icon.png`);
}

function getScreenPath(orientation, key, projectPath) {
    return path.join(projectPath, 'res/screen/android', `${orientation}-${key}-screen.png`);
}

/**
 * Generate all the icons by resizing a source icon to fit all sizes
 * @param {String} src Path to the source icon
 * @param {String} projectPath Path to the root of the cordova project
 */
function generateIcons(src, projectPath) {
    const targetPath = path.join(projectPath, 'res/icon/android');
    const tasks = Object.keys(icons).map((key) => {
        const size = icons[key];
        return util.resizeImage(src, path.join(targetPath, `${key}-icon.png`), size, size);
    });
    return Promise.all(tasks);
}

/**
 * Generate all the splashscreens by resizing a source screen to fit all sizes
 * @param {String} src Path to the source splashscreen
 * @param {String} projectPath Path to the root of the cordova project
 */
function generateScreens(src, projectPath) {
    const tasks = [];
    Object.keys(screens).forEach((key) => {
        const [width, height] = screens[key];
        // Generate two images, one for landscape orientations and one for portrait
        const filePath = getScreenPath('land', key, projectPath);
        const filePathPort = getScreenPath('port', key, projectPath);
        tasks.push(util.resizeImage(src, filePath, width, height));
        tasks.push(util.resizeImage(src, filePathPort, height, width));
    });
    return Promise.all(tasks);
}

module.exports = (context) => {
    const warnings = [];
    const tasks = [];
    // TODO: Check on every build the timestamp of the source icon to regenerate if necessary. Use a config db at the root of the project with a library to read and write from it. Store the image mtime and compare it for next time
    const { projectRoot, shell } = context.opts;
    if (!shell) {
        return;
    }
    shell.processState.setStep('Generating icons and splashcreens');
    const cfg = new Config(path.join(projectRoot, 'config.xml'));
    cfg.selectPlatform('android');
    cfg.removeIcons();
    cfg.removeScreens();
    if (shell.config.ICONS && shell.config.ICONS.ANDROID) {
        const iconSrc = path.join(shell.app, shell.config.ICONS.ANDROID);
        tasks.push(generateIcons(iconSrc, projectRoot)
            .then(() => {
                Object.keys(icons).forEach((icon) => {
                    // No project root. Make it relative to the config.xml
                    cfg.addIcon({ density: icon, src: getIconPath(icon, '') });
                });
            }));
    } else {
        warnings.push('No android icon defined in the config');
    }
    if (shell.config.SPLASHSCREENS && shell.config.SPLASHSCREENS.ANDROID) {
        const screenSrc = path.join(shell.app, shell.config.SPLASHSCREENS.ANDROID);
        tasks.push(generateScreens(screenSrc, projectRoot)
            .then(() => {
                Object.keys(screens).forEach((screen) => {
                    cfg.addScreen({ density: `land-${screen}`, src: getScreenPath('land', screen, '') });
                    cfg.addScreen({ density: `port-${screen}`, src: getScreenPath('port', screen, '') });
                });
            }));
    } else {
        warnings.push('No android splashscreen defined in the config');
    }
    return Promise.all(tasks)
        .then(() => {
            shell.processState.setStep('Updating config.xml');
            return cfg.write();
        })
        .then(() => {
            warnings.forEach((warning) => {
                shell.processState.setWarning(warning);
            });
            shell.processState.setSuccess('Icons and splashscreens generated');
        });
};
