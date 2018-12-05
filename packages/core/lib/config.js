/**
 * Reads config file from an app directory and merge default, environment and app config
 */
const path = require('path');

class ConfigLoader {
    static load(appDir, env = 'development') {
        const configDir = path.join(appDir, 'config');
        const defaultConfig = require(path.join(configDir, 'default.json'));
        const envConfig = require(path.join(configDir, `${env}.json`));
        const config = {};

        Object.assign(config, defaultConfig, envConfig);

        config.ENV = env;
        config.UI_ROOT = '/www/';

        try {
            const pck = require(path.join(appDir, 'package.json'));
            config.UI_VERSION = pck.version;
        } catch (e) { /* ignore */ }

        return config;
    }
}

module.exports = ConfigLoader;
