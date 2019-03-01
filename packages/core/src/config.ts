/**
 * Reads config file from an app directory and merge default, environment and app config
 */
import * as path from 'path';
import * as fs from 'fs';
import * as deepMerge from 'deepmerge';
import { IKashConfig, IConfigOverrides } from './types';

const DEFAULTS = {
    APP_NAME: 'Unnamed App',
    APP_ID: 'com.kano.unknown',
};

/**
 * Behaves like require, but can provide a fallback
 */
function softRequire(moduleId : string, fallback = {}) : any {
    try {
        const content = fs.readFileSync(moduleId, 'utf-8');
        return JSON.parse(content);
    } catch (e) {
        return fallback;
    }
}

export class ConfigLoader {
    static load(appDir : string, env : string = 'development', overrides : IConfigOverrides = {}) : IKashConfig {
        const configDir = path.join(appDir, 'config');
        const defaultConfig = softRequire(path.join(configDir, 'default.json'));
        const envConfig = softRequire(path.join(configDir, `${env}.json`));

        const config = deepMerge<IKashConfig>(defaultConfig, envConfig);

        config.ENV = env;
        config.UI_ROOT = '/www/';

        const pck = softRequire(path.join(appDir, 'package.json'));
        config.VERSION = pck.version || '0.0.0';
        // Property used to be called UI_VERSION, alias it for backward compatibility
        config.UI_VERSION = config.VERSION;

        const merged = deepMerge<IKashConfig>(DEFAULTS, config);

        return deepMerge<IKashConfig>(merged, overrides);
    }
}
