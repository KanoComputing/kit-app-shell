const { Bundler, util } = require('@kano/kit-app-shell-core');
const path = require('path');
const { cordova } = require('cordova-lib');
const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));

const { getProject } = require('./project');

module.exports = (opts = {}) => {
    // Catch cordova logs and displays them
    // TODO: Catch all logs (error, warn, ...)
    // TODO: Find a console UI to display these logs and any subprocess logs
    // in parrallel of the spinner
    cordova.on('log', (...args) => {
        // console.log(...args);
    });
    cordova.on('error', (...args) => {
        console.error(...args);
    });
    cordova.on('warn', (...args) => {
        console.warn(...args);
    });

    // Get a corodva project ready to build
    return getProject({
        ...opts,
        skipCache: opts['no-cache'],
    })
        .then((projectPath) => {
            return Promise.all((opts.clean || []).map(p => rimraf(p)))
                .then(() => {
                    const wwwPath = path.join(projectPath, 'www');
                    // TODO move this to core and make it an optional plugin
                    const wcPath = require.resolve('@webcomponents/webcomponentsjs/webcomponents-bundle.js');
                    const wcFilename = 'webcomponents-bundle.js';
                    // Copy webcomponents bundle
                    return util.fs.copy(wcPath, path.join(wwwPath, wcFilename))
                        .then(() => {
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
                                        replaces: [{
                                            // Avoid jsZip to detect the define from requirejs
                                            // TODO: Scope this to the jszip file
                                            values: {
                                                'typeof define': 'undefined',
                                            },
                                        }],
                                    },
                                    html: {
                                        injectScript: `<script src="/${wcFilename}"></script>`,
                                    },
                                })
                        })
                        .then(bundle => Bundler.write(bundle, wwwPath))
                        .then(() => projectPath);
                });
        })
        .then((projectPath) => {
            // A platform path can be provided to use as a local module, this resolves the name of a potential path
            // to its package name. We then strip the 'cordova-' prefix to extract the platform id
            // This is hacky and could in the future become unreliable.
            // TODO: Maybe we should pass the platforms as ids and resolve their local packages if
            // already installed
            const platformIds = opts.platforms.map(platform => path.basename(platform).replace('cordova-', ''));
            // if the run flag is passed, run the built app on device
            const command = opts.run ? 'run' : 'build';
            const options = Object.assign(opts.buildOpts || {}, { platforms: platformIds });
            return cordova[command](options)
                .then(() => projectPath);
        });
};
