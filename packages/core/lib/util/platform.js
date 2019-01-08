"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function loadPlatformKey(name, key) {
    if (name === 'core' || name === 'cli') {
        return Promise.reject(new Error(`Could not load platform: '${name}' is reserved`));
    }
    return Promise.resolve().then(() => require(`@kano/kit-app-shell-${name}/lib/${key}`)).catch(() => {
        try {
            const modulePath = require.resolve(`@kano/kit-app-shell-${name}`);
            if (modulePath) {
                throw new Error(`Platform '${name}' does not implement '${key}'`);
            }
        }
        catch (e) {
            if (e.code === 'MODULE_NOT_FOUND') {
                throw new Error(`Could not load platform: '${name}' was not installed`);
            }
            throw e;
        }
        return null;
    });
}
exports.loadPlatformKey = loadPlatformKey;
function registerCommands(sywac, platform) {
    if (!platform.cli) {
        return;
    }
    if (typeof platform.cli.commands !== 'function') {
        return;
    }
    platform.cli.commands(sywac);
}
exports.registerCommands = registerCommands;
function registerOptions(sywac, platform, command) {
    if (!platform.cli) {
        return;
    }
    const optionsRegistration = platform.cli[command];
    if (typeof optionsRegistration !== 'function') {
        return;
    }
    optionsRegistration(sywac);
}
exports.registerOptions = registerOptions;
//# sourceMappingURL=platform.js.map