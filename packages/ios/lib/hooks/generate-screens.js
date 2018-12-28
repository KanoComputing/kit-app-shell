const { util, xml } = require('@kano/kit-app-shell-cordova');
const path = require('path');
const Config = require('cordova-config');
const screens = require('../../data/screens');

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
    // TODO: Check on every build the timestamp of the source screen to regenerate if necessary
    const { projectRoot, shell } = context.opts;
    if (!shell) {
        return;
    }
    shell.processState.setStep('Generating splashscreens');
    if (!shell.config.SPLASHSCREENS || !shell.config.SPLASHSCREENS.IOS) {
        shell.processState.setWarning('No iOS splashscreen defined in the config');
        return;
    }
    const iconSrc = path.join(shell.app, shell.config.SPLASHSCREENS.IOS);
    return generateScreens(iconSrc, projectRoot)
        .then(() => {
            shell.processState.setStep('Adding splashscreen to config.xml');
            const cfg = new Config(path.join(projectRoot, 'config.xml'));
            const platformEl = xml.findInConfig(cfg, 'platform/[@name="ios"]');

            screens.forEach((screen) => {
                // Add or update element with new icon
                xml.setElement(
                    platformEl,
                    `splash/[@width="${screen.width}"]`,
                    'splash',
                    '',
                    // No project root. Make it relative to the config.xml
                    { width: screen.width, height: screen.width, src: getScreenPath(screen.name, '') },
                );
            });
            
            return cfg.write();
        })
        .then(() => {
            shell.processState.setSuccess('Splashscreen generated');
        });
};
