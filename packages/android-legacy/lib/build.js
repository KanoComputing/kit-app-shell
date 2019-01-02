const build = require('@kano/kit-app-shell-cordova/lib/build');
const plugins = require('./plugins');

module.exports = (opts) => {
    // Force a false on this preference
    // TODO: More advanced configuration of preferences
    opts.preferences = opts.preferences || {};
    opts.preferences.xwalkMultipleApk = false;
    return build({
        ...opts,
        cacheId: 'android-legacy',
        platforms: plugins.platforms,
        plugins: plugins.plugins,
        hooks: plugins.hooks,
        targets: {
            chrome: 53,
        },
    });
};
