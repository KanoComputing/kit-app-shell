const { util } = require('@kano/kit-app-shell-cordova');

// Load plugins and platforms from the local dependencies.
// This avoid using cordova-fetch and having to download deps on every build
const platforms = [util.getModulePath('cordova-android')];
const plugins = [
    util.getModulePath('cordova-httpd'),
    util.getModulePath('cordova-plugin-proxy'),
];

const hooks = {
    before_prepare: [
        require.resolve('./generate-icons'),
        require.resolve('./set-content'),
    ],
};

module.exports = {
    platforms,
    plugins,
    hooks,
};
