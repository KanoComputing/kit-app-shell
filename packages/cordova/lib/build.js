const { processState, Bundler } = require('@kano/kit-app-shell-core');
const os = require('os');
const path = require('path');
const { promisify } = require('util');
const mkdirp = promisify(require('mkdirp'));
const rimraf = promisify(require('rimraf'));
const { cordova } = require('cordova-lib');
const ProjectCacheManager = require('./cache');

function pascal(s) {
    return s.replace(/(\w)(\w*)/g, (g0, g1, g2) => `${g1.toUpperCase()}${g2.toLowerCase()}`).replace(/ /g, '');
}

function createProject(hash, config, platforms, plugins) {
    const TMP_DIR = path.join(os.tmpdir(), 'kash-cordova-build', hash);
    const PROJECT_DIR = path.join(TMP_DIR, 'project');

    return rimraf(TMP_DIR)
        .then(() => mkdirp(TMP_DIR))
        // TODO: Use cordova template!!!!! This is amazing
        .then(() => cordova.create(PROJECT_DIR, config.APP_ID, pascal(config.APP_NAME)))
        .then(() => process.chdir(PROJECT_DIR))
        .then(() => cordova.platform('add', platforms))
        .then(() => cordova.plugin('add', plugins))
        .then(() => {
            return PROJECT_DIR;
        });
}

function cleanProject(projectPath) {
    const wwwPath = path.join(projectPath, 'www');
    return rimraf(wwwPath)
        .then(() => mkdirp(wwwPath));
}

module.exports = ({ app, config = {}, out, cacheId = 'cordova', platforms = [], plugins = [] }, {}) => {
    const cache = new ProjectCacheManager(cacheId); // TODO: replace with child id

    cordova.on('log', (...args) => {
        console.log(...args);
    });

    processState.setStep('Creating cordova project');

    // Try to find cordova project matching this config
    // The config contains the app id, so each app will have its own project
    // The cache storage uses a cache key specific to platforms using this parent platform
    return cache.getProject(config)
        .then((projectPathOrNull) => {
            let projectPath;
            if (projectPathOrNull) {
                processState.setSuccess('Found cached project for this config');
                // Move the current process there. The whole cordova-lib relies
                // on the cwd being a cdv project
                process.chdir(projectPathOrNull);
                // Found project, make sure the www directory is wiped
                return cleanProject(projectPathOrNull)
                    .then(() => projectPathOrNull);
            }
            // No prject yet, get a hash from the config and create one
            const hash = ProjectCacheManager.configToHash(config);
            return createProject(hash, config, platforms, plugins)
                .then((newProjectPath) => {
                    // Save the project path in cache. For future use
                    return cache.setProject(config, newProjectPath)
                        .then(() => {
                            processState.setSuccess('Created cordova project');
                            return newProjectPath;
                        });
                });
        })
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
