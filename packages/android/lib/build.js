const { build } = require('@kano/kit-app-shell-cordova');
const path = require('path');

module.exports = (opts, commandOpts) => {

    // Load plugins and platforms from the local dependencies.
    // This avoid using cordova-fetch and having to download deps on every build
    const CORDOVA_ANDROID_PATH = path.dirname(require.resolve('cordova-android/package.json'));
    const CORDOVA_BLUETOOTHLE_PLUGIN = path.dirname(require.resolve('cordova-plugin-bluetoothle/package.json'));

    const platforms = [CORDOVA_ANDROID_PATH];
    const plugins = [CORDOVA_BLUETOOTHLE_PLUGIN];

    return build({
        ...opts,
        cacheId: 'android',
        platforms,
        plugins,
    }, commandOpts);
};
