const util = require('@kano/kit-app-shell-cordova/lib/util');
const androidPlatform = require('@kano/kit-app-shell-android/lib/plugins');

const plugins = [
    ...androidPlatform.plugins,
    util.getModulePath('cordova-plugin-crosswalk-webview'),
];

const hooks = {
    ...androidPlatform.hooks,
    before_prepare: [
        ...androidPlatform.hooks.before_prepare,
    ],
};

module.exports = {
    platforms: androidPlatform.platforms,
    plugins,
    hooks,
};
