"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.warn('@kano/kit-app-shell-test is experimental');
function loadProvider(provider) {
    switch (provider) {
        case 'saucelabs': {
            return Promise.resolve().then(() => require('./providers/saucelabs'));
        }
        case 'bitbar': {
            return Promise.resolve().then(() => require('./providers/bitbar'));
        }
        case 'browserstack': {
            return Promise.resolve().then(() => require('./providers/browserstack'));
        }
        case 'kobiton': {
            return Promise.resolve().then(() => require('./providers/kobiton'));
        }
        default: {
            return Promise.resolve(null);
        }
    }
}
exports.default = (wd, mocha, opts) => {
    return loadProvider(opts.provider)
        .then((provider) => {
        if (!provider) {
            return null;
        }
        return provider.default(opts.prebuiltApp, wd, mocha, opts);
    });
};
//# sourceMappingURL=get-builder.js.map