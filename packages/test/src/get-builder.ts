/* eslint no-console: 'off' */
console.warn('@kano/kit-app-shell-test is experimental');

function loadProvider(provider : string) : Promise<any> {
    switch (provider) {
    case 'saucelabs': {
        return import('./providers/saucelabs');
    }
    case 'bitbar': {
        return import('./providers/bitbar');
    }
    case 'browserstack': {
        return import('./providers/browserstack');
    }
    case 'kobiton': {
        return import('./providers/kobiton');
    }
    default: {
        return Promise.resolve(null);
    }
    }
}
/**
 * This file is not under the test directory as it is not used directly to provide
 * a platform test builder
 * It is meant to be loaded using the core's `loadPlatformKey('test', 'get-builder')`
 * This allows this module and its dependencies to not be installed until users need
 * to run more advanced tests
 */
export default (wd, mocha, opts) => {
    return loadProvider(opts.provider)
        .then((provider) => {
            if (!provider) {
                return null;
            }
            return provider.default(opts.prebuiltApp, wd, mocha, opts);
        });
};
