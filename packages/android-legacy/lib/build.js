const { build } = require('@kano/kit-app-shell-cordova');
const plugins = require('./plugins');

module.exports = (opts, commandOpts) => {
    return build({
        ...opts,
        cacheId: 'android-legacy',
        platforms: plugins.platforms,
        plugins: plugins.plugins,
        hooks: plugins.hooks,
        targets: {
            chrome: 53,
        },
    }, commandOpts);
};
