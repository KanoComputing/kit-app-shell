const { util, xml } = require('@kano/kit-app-shell-cordova');
const path = require('path');
const Config = require('cordova-config');
const icons = require('../../data/icons');

function getIconPath(key, projectPath) {
    return path.join(projectPath, 'res/icon/ios', key);
}

function generateIcons(src, projectPath) {
    const targetPath = path.join(projectPath, 'res/icon/ios');
    const tasks = icons.map((icon) => {
        const { width } = icon;
        return util.resizeImage(src, getIconPath(icon.name, projectPath), width, width);
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
    if (!shell.config.ICONS || !shell.config.ICONS.IOS) {
        shell.processState.setWarning('No iOS icon defined in the config');
        return;
    }
    const iconSrc = path.join(shell.app, shell.config.ICONS.IOS);
    return generateIcons(iconSrc, projectRoot)
        .then(() => {
            shell.processState.setStep('Adding icons to config.xml');
            const cfg = new Config(path.join(projectRoot, 'config.xml'));
            const platformEl = xml.findInConfig(cfg, 'platform/[@name="ios"]');

            icons.forEach((icon) => {
                const src = getIconPath(icon.name, '');
                // Add or update element with new icon
                xml.setElement(
                    platformEl,
                    `icon/[@width="${icon.width}"]`,
                    'icon',
                    '',
                    // No project root. Make it relative to the config.xml
                    { width: icon.width, height: icon.width, src, },
                );
            });
            
            return cfg.write();
        })
        .then(() => {
            shell.processState.setSuccess('Icons generated');
        });
};
