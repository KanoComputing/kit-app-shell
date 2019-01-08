import *as platform from '@kano/kit-app-shell-core/lib/util/platform';
import *as test from '@kano/kit-app-shell-core/lib/test';
import { agregateArgv, addConfig } from './argv';

module.exports = function runTest(argv, platformId, command) {
    // Load the builder from the platform
    const getBuilder = platform.loadPlatformKey(platformId, 'test/get-builder');
    return agregateArgv(argv, platformId, command)
        .then(opts => addConfig(opts))
        .then(opts => test({ getBuilder }, opts));
};
