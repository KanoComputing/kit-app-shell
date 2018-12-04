const path = require('path');
const os = require('os');
const { getKanoOSInfo } = require('./util/kano-os');

/* eslint global-require: 0 */
function loadConfig(entry) {
    const env = process.env.NODE_ENV || 'development';
    const configDir = path.join(entry, 'config');
    const defaultConfig = require(path.join(configDir, 'default.json'));
    const envConfig = require(path.join(configDir, `${env}.json`));
    const config = {};

    Object.assign(config, defaultConfig, envConfig);

    config.BUNDLED = typeof process.env.BUNDLED === 'undefined' ? config.BUNDLED : process.env.BUNDLED;

    config.ENV = env;
    config.ENTRY = entry;
    config.UI_ROOT = `/${path.relative(__dirname + '/..', entry).replace(/\\/ig, '/')}/`;

    const kanoOSInfo = getKanoOSInfo();

    if (kanoOSInfo) {
        config.OS_PLATFORM = kanoOSInfo.platform;
        config.OS_VERSION = kanoOSInfo.release;
    } else {
        config.OS_PLATFORM = os.platform();
        config.OS_VERSION = os.release();
    }


    try {
        const pck = require(path.join(entry, 'package.json'));
        config.UI_VERSION = pck.version;
    } catch (e) {}

    return config;
}

module.exports = loadConfig;
