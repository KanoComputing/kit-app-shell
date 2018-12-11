const { build } = require('@kano/kit-app-shell-cordova');
const platform = require('./platform');

module.exports = (opts, commandOpts) => {
    return build({
        ...opts,
        cacheId: 'ios',
        platforms: platform.platforms,
        plugins: platform.plugins,
        hooks: platform.hooks,
        targets: {
            safari: 10,
        },
    }, commandOpts);
};
