import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { cordova } from 'cordova-lib';
import { ProjectCacheManager } from './cache';
import { getModulePath } from './util';
import { CordovaConfig } from './cordova-config';
import { chdir } from './chdir';
import * as mkdripCb from 'mkdirp';
import * as rimrafCb from 'rimraf';
import { CordovaRunOptions } from './types';

const mkdirp = promisify(mkdripCb);
const rimraf = promisify(rimrafCb);

const realpath = promisify(fs.realpath);
const exists = promisify(fs.exists);

const DEFAULT_PREFERENCES = {
    ShowSplashScreenSpinner: false,
    SplashMaintainAspectRatio: true,
    loadUrlTimeoutValue: 30000,
};

const DEFAULT_PLUGINS = [
    'cordova-plugin-bluetoothle',
    'cordova-plugin-device',
    'cordova-plugin-splashscreen',
];

const STEP_PREFIX = 'Setting up cordova';

/**
 * Deletes the contents of the www directory of a project
 * @param {String} root Path to the root of the cordova project
 */
function cleanProject(root) {
    const wwwPath = path.join(root, 'www');
    return rimraf(wwwPath)
        .then(() => mkdirp(wwwPath));
}

/**
 * Creates a cordova project with the platforms, plugins and hooks provided
 * @param {Object} opts All the options provided to the command
 * @param {String} hash Hash key of the config
 */
function createProject(opts : CordovaRunOptions, hash : string) {
    const {
        app,
        config,
        plugins,
        platforms,
        hooks,
        cacheId = 'cordova',
        tmpdir = os.tmpdir(),
    } = opts;
    const TMP_DIR = path.join(tmpdir, `kash-${cacheId}-build`, hash);

    // Resolve the location of the default plugins
    const defaultPlugins = DEFAULT_PLUGINS.map((name) => getModulePath(name));

    // Merge default plugins and platform plugins
    const allPlugins = defaultPlugins.concat(plugins);

    processState.setStep(`${STEP_PREFIX}: (1/5) Creating project`);

    // Clear previous projects
    return rimraf(TMP_DIR)
        // Ensure the directory exists
        .then(() => mkdirp(TMP_DIR))
        // Resolve the location on the disk.
        // This is required on macOS as their tmp directory is a symlink
        .then(() => realpath(TMP_DIR))
        .then((REAL_TMP_DIR) => {
            const PROJECT_DIR = path.join(REAL_TMP_DIR, 'project');
            // Create the project
            return cordova.create(PROJECT_DIR, config.APP_ID, config.APP_NAME)
                // Move the process to the project dir.
                // This is required as cordova-lib expects to run in a cordova project directory
                .then(() => chdir(PROJECT_DIR))
                .then(() => {
                    processState.setStep(`${STEP_PREFIX}: (2/5) Updating config`);
                    const cfg = new CordovaConfig(path.join(PROJECT_DIR, 'config.xml'));
                    // Grab preferences from user input
                    const { preferences = {} } = opts;
                    // Merge with the default preferences
                    const finalPreferences = Object.assign({}, DEFAULT_PREFERENCES, preferences);
                    Object.keys(hooks).forEach((type) => {
                        hooks[type].forEach((src) => {
                            cfg.addHook(type, path.relative(PROJECT_DIR, src));
                        });
                    });
                    // Set preferences from options
                    Object.keys(finalPreferences).forEach((key) => {
                        cfg.setPreference(key, finalPreferences[key]);
                    });
                    return cfg.write();
                })
                .then(() => {
                    processState.setStep(`${STEP_PREFIX}: (3/5) Adding platform`);
                    return cordova.platform('add', platforms);
                })
                .then(() => {
                    processState.setStep(`${STEP_PREFIX}: (4/5) Adding plugins`);
                    return cordova.plugin('add', allPlugins);
                })
                .then(() => {
                    processState.setStep(`${STEP_PREFIX}: (5/5) Preparing`);
                    // Provide a `shell` property to the hooks
                    return cordova.prepare({
                        shell: {
                            app,
                            config,
                            processState,
                            opts,
                        },
                    });
                })
                .then(() => PROJECT_DIR);
        });
}

/**
 * Retrieves a previously created project using the config's hash as a key
 * Will create and cache a project if none was found
 */
export function getProject(opts : CordovaRunOptions & { skipCache : boolean }) {
    const cache = new ProjectCacheManager(opts.cacheId);

    processState.setStep(STEP_PREFIX);

    // Using a cache can be skipped by setting cache to false
    const getCache = opts.skipCache ? Promise.resolve(null) : cache.getProject(opts.config);

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
                            return cache.deleteProject(opts.config)
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
                // Use a custom module to easily mock the behavior of chdir
                chdir(projectPathOrNull);
                // Found project, make sure the www directory is wiped
                return cleanProject(projectPathOrNull)
                    .then(() => projectPathOrNull);
            }
            // No project yet, get a hash from the config and create one
            const hash = ProjectCacheManager.configToHash(opts.config);
            return createProject(opts, hash)
                // Save the project path in cache. For future use
                .then((newProjectPath) => cache.setProject(opts.config, newProjectPath)
                    .then(() => {
                        processState.setSuccess('Created cordova project');
                        return newProjectPath;
                    }));
        });
}
