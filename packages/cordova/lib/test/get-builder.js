/**
 * Find the builder matching the provided target device provider
 */
module.exports = (wd, mocha, opts) => {
    switch (opts.provider) {
        case 'saucelabs': {
            return require('./saucelabs')(opts.prebuiltApp, wd, mocha, opts);
        }
        case 'bitbar': {
            return require('./bitbar')(opts.prebuiltApp, wd, mocha, opts);
        }
        case 'browserstack': {
            return require('./browserstack')(opts.prebuiltApp, wd, mocha, opts);
        }
        case 'kobiton': {
            return require('./kobiton')(opts.prebuiltApp, wd, mocha, opts);
        }
        default: {
            return null;
        }
    }
};
