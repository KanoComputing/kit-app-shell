const util = require('@kano/kit-app-shell-cordova/lib/util');

// Load plugins and platforms from the local dependencies.
// This avoid using cordova-fetch and having to download deps on every build
const platforms = [util.getModulePath('cordova-android')];
const plugins = [
    util.getModulePath('cordova-plugin-ionic-webview'),
];

const hooks = {
    before_prepare: [
        require.resolve('./hooks/generate-icons'),
        require.resolve('./hooks/config'),
    ],
    after_prepare: [
        require.resolve('./hooks/repo-hack'),
        require.resolve('./hooks/update-version'),
    ],
};

module.exports = {
    platforms,
    plugins,
    hooks,
};
