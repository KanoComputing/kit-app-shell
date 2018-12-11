const { util } = require('@kano/kit-app-shell-cordova');

// Load plugins and platforms from the local dependencies.
// This avoid using cordova-fetch and having to download deps on every build
const platforms = [util.getModulePath('cordova-android')];
const plugins = [
    util.getModulePath('cordova-httpd'),
];

const hooks = {
    before_prepare: [
        require.resolve('./generate-icons'),
        require.resolve('./set-content'),
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
