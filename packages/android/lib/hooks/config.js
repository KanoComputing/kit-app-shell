const { xml } = require('@kano/kit-app-shell-cordova');
const path = require('path');
const Config = require('cordova-config');

/**
 * Transform a number into a string while contaraining its length
 * If the number is longer than the length, it'll be trimmed from the left to fit
 * 0 are added as left padding
 */
function bindNumberAsString(value, length) {
    const str = value.toString().substr(-length);
    return str.padStart(length, '0');
}

module.exports = (context) => {
    const { projectRoot, shell } = context.opts;
    // No shell means it's running more than once
    if (!shell) {
        return;
    }
    const cfg = new Config(path.join(projectRoot, 'config.xml'));

    if (shell.config.APP_DESCRIPTION) {
        cfg.setDescription(config.APP_DESCRIPTION);
    }
    if (shell.config.UI_VERSION) {
        cfg.setVersion(shell.config.UI_VERSION);

        const [major, minor, patch] = shell.config.UI_VERSION.split('.');

        const buildNumber = shell.config.BUILD_NUMBER || 0;
    
        const parts = [
            bindNumberAsString(major, 2),
            bindNumberAsString(minor, 2),
            bindNumberAsString(patch, 2),
            bindNumberAsString(buildNumber, 3),
        ];

        if (shell.config.BUILD_NUMBER) {
            cfg.setAndroidVersionCode(`1${parts.join('')}`);
        }
    }

    const platformEl = xml.findInConfig(cfg, 'platform/[@name="android"]');

    const preferences = {
        Port: 8888,
        'android-targetSdkVersion': 28,
        ShowSplashScreenSpinner: false,
        loadUrlTimeoutValue: 30000
    };

    Object.keys(preferences).forEach((preference) => {
        xml.addElement(cfg._doc._root, 'preference', '', {
            name: preference,
            value: preferences[preference],
        });
    });

    xml.setElement(cfg._doc._root, 'content', 'content', '', {
        src: 'http://localhost:8888/index.html',
    });
    return cfg.write();
};