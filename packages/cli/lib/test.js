const platform = require('@kano/kit-app-shell-core/lib/util/platform');
const test = require('@kano/kit-app-shell-core/lib/test');
const { agregateArgv, addConfig } = require('./argv');

module.exports = function runTest(argv, platformId, command) {
    // Load the builder from the platform
    const getBuilder = platform.loadPlatformKey(platformId, 'test/get-builder');
    return agregateArgv(argv, platformId, command)
        .then(opts => addConfig(opts, argv.app))
        .then(opts => test({ getBuilder }, opts));
};
