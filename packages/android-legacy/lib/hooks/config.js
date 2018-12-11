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

    xml.addElement(cfg._doc._root, 'preference', '', {
        name: 'android-minSdkVersion',
        value: 19,
    });
    xml.addElement(cfg._doc._root, 'preference', '', {
        name: 'xwalkMultipleApk',
        value: false,
    });
    return cfg.write();
};