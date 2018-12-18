const { util, xml } = require('@kano/kit-app-shell-cordova');
const path = require('path');
const Config = require('cordova-config');
const screens = require('../../data/screens');

function getScreenPath(orientation, key, projectPath) {
    return path.join(projectPath, 'res/screen/android', `${orientation}-${key}-screen.png`);
}

function generateScreens(src, projectPath) {
    const tasks = Object.keys(screens).map((key) => {
        const [width, height] = screens[key];
        const filePath = getScreenPath('land', key, projectPath);
        return util.resizeImage(src, filePath, width, height, { fit: 'outside' });
    });
    return Promise.all(tasks);
}

module.exports = (context) => {
    // TODO: Check on every build the timestamp of the source screen to regenerate if necessary
    const { projectRoot, shell } = context.opts;
    if (!shell) {
        return;
    }
    shell.processState.setStep('Generating icons');
    if (!shell.config.SPLASHSCREENS || !shell.config.SPLASHSCREENS.ANDROID) {
        shell.processState.setWarning('No android splashscreen defined in the config');
        return;
    }
    const iconSrc = path.join(shell.app, shell.config.SPLASHSCREENS.ANDROID);
    return generateScreens(iconSrc, projectRoot)
        .then(() => {
            shell.processState.setStep('Adding splashscreen to config.xml');
            const cfg = new Config(path.join(projectRoot, 'config.xml'));
            const platformEl = xml.findInConfig(cfg, 'platform/[@name="android"]');

            Object.keys(screens).forEach((screen) => {
                // Add or update element with new icon
                xml.setElement(
                    platformEl,
                    `splash/[@density="${screen}"]`,
                    'splash',
                    '',
                    // No project root. Make it relative to the config.xml
                    { density: screen, src: getScreenPath('land', screen, '') },
                );
            });
            
            return cfg.write();
        })
        .then(() => {
            shell.processState.setSuccess('Splashecreen generated generated');
        });
};
