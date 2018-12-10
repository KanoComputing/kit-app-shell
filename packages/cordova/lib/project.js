const { processState, util } = require('@kano/kit-app-shell-core');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const mkdirp = promisify(require('mkdirp'));
const rimraf = promisify(require('rimraf'));
const { cordova } = require('cordova-lib');
const ProjectCacheManager = require('./cache');
const { getModulePath } = require('./util');
const Config = require('cordova-config');

const exists = promisify(fs.exists);

/**
 * Deletes the contents of the www directory of a project
 */
function cleanProject(root) {
    const wwwPath = path.join(root, 'www');
    return rimraf(wwwPath)
        .then(() => mkdirp(wwwPath));
}
/**
 * Creates a cordova project with the platforms, plugins and hooks provided
 */
function createProject(app, hash, config, platforms, plugins, hooks) {
    const TMP_DIR = path.join(os.tmpdir(), 'kash-cordova-build', hash);
    const PROJECT_DIR = path.join(TMP_DIR, 'project');

    const defaultPluginNames = [
        'cordova-plugin-bluetoothle',
        'cordova-plugin-device',
        'cordova-plugin-splashscreen',
    ];

    const defaultPlugins = defaultPluginNames.map(name => getModulePath(name));

    const allPlugins = defaultPlugins.concat(plugins);

    return rimraf(TMP_DIR)
        .then(() => mkdirp(TMP_DIR))
        .then(() => cordova.create(PROJECT_DIR, config.APP_ID, util.format.pascal(config.APP_NAME)))
        .then(() => process.chdir(PROJECT_DIR))
        .then(() => {
            const cfg = new Config(path.join(PROJECT_DIR, 'config.xml'));
            Object.keys(hooks).forEach((type) => {
                hooks[type].forEach(src => cfg.addHook(type, path.relative(PROJECT_DIR, src)));
            });
            return cfg.write();
        })
        .then(() => cordova.platform('add', platforms))
        .then(() => cordova.plugin('add', allPlugins))
        .then(() => cordova.prepare({ shell: { app, config, processState } }))
        .then(() => {
            return PROJECT_DIR;
        });
}

/**
 * Retrieves a previously created project using the config's hash as a key
 * Will create and cache a project if none was found
 */
function getProject({ app, config, cacheId, plugins, platforms, hooks }, commandOpts) {
    const cache = new ProjectCacheManager(cacheId);

    processState.setStep('Setting up cordova project');

    // Using a cache can be skipped by setting cache to false
    const getCache = commandOpts.cache ? cache.getProject(config) : Promise.resolve(null);

    // Try to find cordova project matching this config
    // The config contains the app id, so each app will have its own project
    // The cache storage uses a cache key specific to platforms using this parent platform
    // e.g. android will use a different cache than ios even if using the same config
    return getCache
        .then((projectPathOrNull) => {
            if (projectPathOrNull) {
                // Found a path to an existing project, but said path might
                // have been deleted
                return exists(projectPathOrNull)
                    .then((doesExists) => {
                        if (!doesExists) {
                            // Path does not exists anymore
                            return cache.deleteProject(config)
                                .then(() => null);
                        }
                        // Project found
                        return projectPathOrNull;
                    });
            }
            return null;
        })
        .then((projectPathOrNull) => {
            if (projectPathOrNull) {
                processState.setSuccess('Found cached project for this config');
                // Move the current process there. The whole cordova-lib relies
                // on the cwd being a cdv project
                process.chdir(projectPathOrNull);
                // Found project, make sure the www directory is wiped
                return cleanProject(projectPathOrNull)
                    .then(() => projectPathOrNull);
            }
            // No project yet, get a hash from the config and create one
            const hash = ProjectCacheManager.configToHash(config);
            return createProject(app, hash, config, platforms, plugins, hooks)
                .then((newProjectPath) => {
                    // Save the project path in cache. For future use
                    return cache.setProject(config, newProjectPath)
                        .then(() => {
                            processState.setSuccess('Created cordova project');
                            return newProjectPath;
                        });
                });
        });
}

module.exports = {
    getProject,
};
