const { test } = require('@kano/kit-app-shell-core');
const { loadPlatformKey } = require('./platform');
const { agregateArgv } = require('./argv');

module.exports = function runTest(argv, platformId, command) {
    const getBuilder = loadPlatformKey(platformId, 'test/get-builder');
    return agregateArgv(argv, platformId, command)
            .then(({ opts, commandOpts }) => test({ getBuilder }, opts, commandOpts));
}