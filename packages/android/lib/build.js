const { build } = require('@kano/kit-app-shell-cordova');
const path = require('path');

function getModulePath(name) {
    return path.dirname(require.resolve(`${name}/package.json`));
}

module.exports = (opts, commandOpts) => {

    // Load plugins and platforms from the local dependencies.
    // This avoid using cordova-fetch and having to download deps on every build
    const pluginNames = [
        'cordova-plugin-bluetoothle',
        'cordova-plugin-device',
        'cordova-plugin-splashscreen',
    ];
    const platforms = [getModulePath('cordova-android')];
    const plugins = pluginNames.map(name => getModulePath(name));

    return build({
        ...opts,
        cacheId: 'android',
        platforms,
        plugins,
    }, commandOpts);
};
