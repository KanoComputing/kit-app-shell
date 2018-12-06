const { Bundler } = require('@kano/kit-app-shell-core');
const path = require('path');
const { cordova } = require('cordova-lib');

const { getProject } = require('./project');

module.exports = ({ app, config = {}, out, cacheId = 'cordova', platforms = [], plugins = [], hooks = {} }, commandOpts) => {
    cordova.on('log', (...args) => {
        console.log(...args);
    });

    // Try to find cordova project matching this config
    // The config contains the app id, so each app will have its own project
    // The cache storage uses a cache key specific to platforms using this parent platform
    return getProject({
        app,
        config,
        cacheId,
        platforms,
        plugins,
        hooks,
    }, commandOpts)
        .then((projectPath) => {
            const wwwPath = path.join(projectPath, 'www');
            // Bundle the cordova shell and provided app into the www directory
            return Bundler.bundle(
                __dirname + '/../www/index.html',
                __dirname + '/../www/index.js',
                path.join(app, 'index.js'),
                config,
                {
                    appJs: {}, // TODO: pass the options
                    js: {
                        replaces: {
                            // Avoid jsZip to detect the define from requirejs
                            'typeof define': 'undefined',
                        },
                    },
                })
                .then(bundle => Bundler.write(bundle, wwwPath))
                .then(() => projectPath);
        })
        .then((projectPath) => {
            // A platform path can be provided to use a local, this resolves the name of a potential path
            // to its package name. We then strip the 'cordova-' prefix to extract the platform id
            // This is hacky and could in the future become unreliable.
            // Maybe we should pass the platforms as ids and resolve their local packages if
            // already installed
            const platformIds = platforms.map(platform => path.basename(platform).replace('cordova-', ''));
            return cordova.build(platformIds);
            // console.log(projectPath);
        });
};
