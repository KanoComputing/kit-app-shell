// Loads a platform sub-module
// This allows us to load just the CLI config and only the required command
// This speeds up the overall CLI by skipping eventual dependencies
// that will never run for a session,
// e.g. Do not load heavy testing frameworks when we only need to run the app
// The default location is lib/<key>. It will fallback to loading the whole module if
// getting the sub-module fails.
function loadPlatformKey(name, key) {
    if (name === 'core' || name === 'cli') {
        throw new Error(`Could not load platform: '${name}' is reserved`);
    }
    try {
        const loaded = require(`@kano/kit-app-shell-${name}/lib/${key}`);
        return loaded;
    } catch (err) {
        // Could not find the specific file. Need to figure out if the platform is not installed
        // Or doesn't implement that file
        // Use require.resolve here to avoid loading the whole module
        try {
            const modulePath = require.resolve(`@kano/kit-app-shell-${name}`);
            if (modulePath) {
                throw new Error(`Platform '${name}' does not implement '${key}'`);
            }
        } catch (e) {
            // Failed to resolve the module, it is not installed
            if (e.code === 'MODULE_NOT_FOUND') {
                throw new Error(`Could load platform: '${name}' was not installed`);
            }
            throw e;
        }
    }
    return null;
}

function registerCommands(sywac, platform) {
    // Ignore missing cli
    if (!platform.cli) {
        return;
    }
    // Ignore missing or wrongly typed commands config
    if (typeof platform.cli.commands !== 'function') {
        return;
    }
    platform.cli.commands(sywac);
}

function registerOptions(sywac, platform, command) {
    // Ignore missing cli
    if (!platform.cli) {
        return;
    }
    // Fetch the function that will regiter options for a given command
    const optionsRegistration = platform.cli[command];

    if (typeof optionsRegistration !== 'function') {
        return;
    }
    optionsRegistration(sywac);
}

module.exports = {
    loadPlatformKey,
    registerCommands,
    registerOptions,
};
