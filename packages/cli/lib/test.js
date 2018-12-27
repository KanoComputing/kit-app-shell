const { test, util } = require('@kano/kit-app-shell-core');
const { agregateArgv, addConfig } = require('./argv');

module.exports = function runTest(argv, platformId, command) {
    const getBuilder = util.platform.loadPlatformKey(platformId, 'test/get-builder');
    return agregateArgv(argv, platformId, command)
            .then((opts) => addConfig(opts, argv.app))
            .then((opts) => test({ getBuilder }, opts));
}