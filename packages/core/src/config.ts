/**
 * Reads config file from an app directory and merge default, environment and app config
 */
import * as path from 'path';
import * as fs from 'fs';
import * as deepMerge from 'deepmerge';

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

export class ConfigLoader {
    // TODO: any
    static load(appDir, env = 'development') : any {
        const configDir = path.join(appDir, 'config');
        const defaultConfig = softRequire(path.join(configDir, 'default.json'));
        const envConfig = softRequire(path.join(configDir, `${env}.json`));

        // TODO: as any
        const config = deepMerge(defaultConfig, envConfig) as any;

        config.ENV = env;
        config.UI_ROOT = '/www/';

        const pck = softRequire(path.join(appDir, 'package.json'));
        config.VERSION = pck.version || '0.0.0';
        // Property used to be called UI_VERSION, alias it for backward compatibility
        config.UI_VERSION = config.VERSION;

        return deepMerge(DEFAULTS, config);
    }
}
