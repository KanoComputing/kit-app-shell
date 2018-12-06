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
    const platformEl = xml.findInConfig(cfg, 'platform/[@name="android"]');

    const preferences = {
        Port: 8000,
        'android-targetSdkVersion': 27
    }

    xml.setElement(platformEl, 'content', 'content', '', {
        src: 'http://localhost:8000/index.html',
    });
    xml.addElement(cfg._doc._root, 'preference', '', {
        name: 'android-targetSdkVersion',
        value: 27,
    });
    xml.addElement(cfg._doc._root, 'preference', '', {
        name: 'Port',
        value: 8000,
    });
    xml.addElement(cfg._doc._root, 'access', '', {
        origin: '*',
    });
    return cfg.write();
};