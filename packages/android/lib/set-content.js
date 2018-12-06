const { xml } = require('@kano/kit-app-shell-cordova');
const path = require('path');
const Config = require('cordova-config');

module.exports = (context) => {
    const { projectRoot } = context.opts;
    const cfg = new Config(path.join(projectRoot, 'config.xml'));
    const platformEl = xml.findInConfig(cfg, 'platform/[@name="android"]');

    xml.setElement(platformEl, 'content', 'content', '', {
        src: 'http://localhost:8888/index.html',
    });
    cfg.setElement('preference', '', {
        name: 'android-targetSdkVersion',
        value: 27,
    });
    cfg.setElement('access', '', {
        origin: '*',
    });
    return cfg.write();
};