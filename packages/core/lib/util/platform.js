function loadPlatform(name) {
    if (name === 'common' || name === 'cli') {
        throw new Error(`Could not load platform: '${name}' is reserved`);
    }
    let loaded;
    try {
        loaded = require(`@kano/kit-app-shell-${name}`);
    } catch (e) {
        // TODO: Detect if it is a module loading error
        throw new Error(`Could load platform: '${name}' was not installed`);
    }
    return loaded;
}

// Loads a platform sub-module
// This allows us to load just the CLI config and only the required command
// This speeds up the overall CLI by skipping eventual dependencies that will never run for a session
// e.g. Do not load heavy testing frameworks when we only need to run the app
// The default location is lib/<key>. It will fallback to loading the whole module if
// getting the sub-module fails.
// TODO: Maybe only load submodule and force platforms to organise their files properly
function loadPlatformKey(name, key) {
    if (name === 'common' || name === 'cli') {
        throw new Error(`Could not load platform: '${name}' is reserved`);
    }
    let loaded;
    try {
        loaded = require(`@kano/kit-app-shell-${name}/lib/${key}`);
    } catch (e) {
        const mod = loadPlatform(name);
        loaded = mod[name];
    }
    return loaded;
}

function registerCommands(sywac, platform) {
    // Ignore missing cli
    if (!platform.cli) {
        return;
    }
    // Ignore missing or wrongly typed commands config
    // TODO: Throw error when commands is here but not a function for explicit failure
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
    // Ignore if wrong type
    // TODO: See TODO for registerCommands
    if (typeof optionsRegistration !== 'function') {
        return;
    }
    optionsRegistration(sywac);
}

module.exports = {
    loadPlatform,
    loadPlatformKey,
    registerCommands,
    registerOptions,
};
