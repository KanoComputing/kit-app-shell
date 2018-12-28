const run = require('@kano/kit-app-shell-cordova/lib/run');
const platform = require('./platform');

module.exports = (opts) => {
    return run({
        ...opts,
        platforms: platform.platforms,
        plugins: platform.plugins,
        hooks: platform.hooks,
        cacheId: 'ios',
    });
};
