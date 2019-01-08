"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const deepMerge = require("deepmerge");
const DEFAULTS = {
    APP_NAME: 'Unnamed App',
    APP_ID: 'com.kano.unknown',
};
function softRequire(moduleId, fallback = {}) {
    try {
        const content = fs.readFileSync(moduleId, 'utf-8');
        return JSON.parse(content);
    }
    catch (e) {
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
        config.UI_VERSION = config.VERSION;
        return deepMerge(DEFAULTS, config);
    }
}
exports.ConfigLoader = ConfigLoader;
//# sourceMappingURL=config.js.map