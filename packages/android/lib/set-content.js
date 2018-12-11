const { xml } = require('@kano/kit-app-shell-cordova');
const path = require('path');
const Config = require('cordova-config');

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
        if (shell.config.BUILD_NUMBER) {
            cfg.setAndroidVersionCode(`1${shell.config.UI_VERSION.replace(/\./g, '')}${shell.config.BUILD_NUMBER}`);
            // TODO: Move this to ios platform
            // configXML.setIOSBundleVersion(process.env.BUILD_NUMBER);
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