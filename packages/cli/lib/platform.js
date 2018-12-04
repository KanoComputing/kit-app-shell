const { log } = require('@kano/kit-app-shell-common');

function loadPlatform(name) {
    if (name === 'common' || name === 'cli') {
        throw new Error(`Could not load platform: '${name}' is reserved`);
    }
    let loaded;
    try {
        loaded = require(`@kano/kit-app-shell-${name}`);
    } catch (e) {
        log.error(e);
        // TODO: Detect if it is a module loading error
        throw new Error(`Could load platform: '${name}' was not installed`);
    }
    return loaded;
}

module.exports = {
    loadPlatform,
};
