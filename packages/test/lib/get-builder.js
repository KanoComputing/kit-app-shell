
/**
 * This file is not under the test directory as it is not used directly to provide a platform test builder
 * It is meant to be loaded using the core's `loadPlatformKey('test', 'get-builder')`
 * This allows this module and its dependencies to not be installed until users need
 * to run more advanced tests
 */
module.exports = (wd, mocha, opts) => {
    switch (opts.provider) {
        case 'saucelabs': {
            return require('./providers/saucelabs')(opts.prebuiltApp, wd, mocha, opts);
        }
        case 'bitbar': {
            return require('./providers/bitbar')(opts.prebuiltApp, wd, mocha, opts);
        }
        case 'browserstack': {
            return require('./providers/browserstack')(opts.prebuiltApp, wd, mocha, opts);
        }
        case 'kobiton': {
            return require('./providers/kobiton')(opts.prebuiltApp, wd, mocha, opts);
        }
        default: {
            return null;
        }
    }
};
