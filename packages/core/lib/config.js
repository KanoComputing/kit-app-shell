/**
 * Reads config file from an app directory and merge default, environment and app config
 */
const path = require('path');
const fs = require('fs');
const deepMerge = require('deepmerge');

const DEFAULTS = {
    APP_NAME: 'Unnamed App',
    APP_ID: 'com.kano.unknown',
};

/**
 * Behaves like require, but can provide a fallback
 */
function softRequire(moduleId, fallback = {}) {
    try {
        const content = fs.readFileSync(moduleId, 'utf-8');
        return JSON.parse(content);
    } catch (e) {
        return fallback;
    }
}

class ConfigLoader {
    static load(appDir, env = 'development') {
        const configDir = path.join(appDir, 'config');
        const defaultConfig = softRequire(path.join(configDir, 'default.json'));
        const envConfig = softRequire(path.join(configDir, `${env}.json`));

        const config = deepMerge(defaultConfig, envConfig);

        config.ENV = env;
        config.UI_ROOT = '/www/';

        const pck = softRequire(path.join(appDir, 'package.json'));
        config.VERSION = pck.version || '0.0.0';
        // Property used to be called UI_VERSION, alias it for backward compatibility
        config.UI_VERSION = config.VERSION;

        return deepMerge(DEFAULTS, config);
    }
}

module.exports = ConfigLoader;
