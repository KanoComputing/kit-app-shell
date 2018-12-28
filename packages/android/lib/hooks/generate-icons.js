const util = require('@kano/kit-app-shell-cordova/lib/util');
const xml = require('@kano/kit-app-shell-cordova/lib/xml');
const path = require('path');
const Config = require('cordova-config');
const icons = require('../../data/icons');

function getIconPath(key, projectPath) {
    return path.join(projectPath, 'res/icon/android', `${key}-icon.png`);
}

function generateIcons(src, projectPath) {
    const targetPath = path.join(projectPath, 'res/icon/android');
    const tasks = Object.keys(icons).map((key) => {
        const size = icons[key];
        return util.resizeImage(src, path.join(targetPath, `${key}-icon.png`), size, size);
    });
    return Promise.all(tasks);
}

module.exports = (context) => {
    // TODO: Check on every build the timestamp of the source icon to regenerate if necessary
    const { projectRoot, shell } = context.opts;
    if (!shell) {
        return;
    }
    shell.processState.setStep('Generating icons');
    if (!shell.config.ICONS || !shell.config.ICONS.ANDROID) {
        shell.processState.setWarning('No android icon defined in the config');
        return;
    }
    const iconSrc = path.join(shell.app, shell.config.ICONS.ANDROID);
    return generateIcons(iconSrc, projectRoot)
        .then(() => {
            shell.processState.setStep('Adding icons to config.xml');
            const cfg = new Config(path.join(projectRoot, 'config.xml'));
            const platformEl = xml.findInConfig(cfg, 'platform/[@name="android"]');

            Object.keys(icons).forEach((icon) => {
                // Add or update element with new icon
                xml.setElement(
                    platformEl,
                    `icon/[@density="${icon}"]`,
                    'icon',
                    '',
                    // No project root. Make it relative to the config.xml
                    { density: icon, src: getIconPath(icon, '') },
                );
            });
            
            return cfg.write();
        })
        .then(() => {
            shell.processState.setSuccess('Icons generated');
        });
};
