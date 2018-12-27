const { util } = require('@kano/kit-app-shell-core');

/**
 * Find the builder matching the provided target device provider
 */
module.exports = (wd, mocha, opts) => {
    // If not a local run, try to load the providers from the test module
    // If the user didn't install that module they will be prompted to do so
    if (opts.provider !== 'local') {
        return util.platform.loadPlatformKey('test', 'get-builder')(wd, mocha, opts);
    }
    return null;
};
