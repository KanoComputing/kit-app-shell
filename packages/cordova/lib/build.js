const { Bundler } = require('@kano/kit-app-shell-core');
const path = require('path');
const { cordova } = require('cordova-lib');

const { getProject } = require('./project');

module.exports = (opts = {}, commandOpts = {}) => {
    // Catch cordova logs and displays them
    // TODO: Catch all logs (error, warn, ...)
    // TODO: Find a console UI to display these logs and any subprocess logs
    // in parrallel of the spinner
    cordova.on('log', (...args) => {
        console.log(...args);
    });

    // Get a corodva project ready to build
    return getProject({
        ...opts,
        skipCache: !commandOpts.cache,
    })
        .then((projectPath) => {
            const wwwPath = path.join(projectPath, 'www');
            // Bundle the cordova shell and provided app into the www directory
            return Bundler.bundle(
                __dirname + '/../www/index.html',
                __dirname + '/../www/index.js',
                path.join(opts.app, 'index.js'),
                opts.config,
                {
                    appJs: {
                        ...opts,
                    },
                    js: {
                        bundleOnly: opts.bundleOnly,
                        targets: opts.targets,
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
            // A platform path can be provided to use as a local module, this resolves the name of a potential path
            // to its package name. We then strip the 'cordova-' prefix to extract the platform id
            // This is hacky and could in the future become unreliable.
            // TODO: Maybe we should pass the platforms as ids and resolve their local packages if
            // already installed
            const platformIds = opts.platforms.map(platform => path.basename(platform).replace('cordova-', ''));
            return cordova.build(platformIds);
        });
};
