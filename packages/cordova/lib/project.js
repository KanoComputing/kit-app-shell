"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const process_state_1 = require("@kano/kit-app-shell-core/lib/process-state");
const os = require("os");
const fs = require("fs");
const path = require("path");
const util_1 = require("util");
const cordova_lib_1 = require("cordova-lib");
const cache_1 = require("./cache");
const util_2 = require("./util");
const cordova_config_1 = require("./cordova-config");
const chdir_1 = require("./chdir");
const mkdripCb = require("mkdirp");
const rimrafCb = require("rimraf");
const mkdirp = util_1.promisify(mkdripCb);
const rimraf = util_1.promisify(rimrafCb);
const realpath = util_1.promisify(fs.realpath);
const exists = util_1.promisify(fs.exists);
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
function cleanProject(root) {
    const wwwPath = path.join(root, 'www');
    return rimraf(wwwPath)
        .then(() => mkdirp(wwwPath));
}
function createProject(opts, hash) {
    const { app, config, plugins, platforms, hooks, cacheId = 'cordova', tmpdir = os.tmpdir(), } = opts;
    const TMP_DIR = path.join(tmpdir, `kash-${cacheId}-build`, hash);
    const defaultPlugins = DEFAULT_PLUGINS.map(name => util_2.getModulePath(name));
    const allPlugins = defaultPlugins.concat(plugins);
    process_state_1.processState.setStep(`${STEP_PREFIX}: (1/5) Creating project`);
    return rimraf(TMP_DIR)
        .then(() => mkdirp(TMP_DIR))
        .then(() => realpath(TMP_DIR))
        .then((REAL_TMP_DIR) => {
        const PROJECT_DIR = path.join(REAL_TMP_DIR, 'project');
        return cordova_lib_1.cordova.create(PROJECT_DIR, config.APP_ID, config.APP_NAME)
            .then(() => chdir_1.chdir(PROJECT_DIR))
            .then(() => {
            process_state_1.processState.setStep(`${STEP_PREFIX}: (2/5) Updating config`);
            const cfg = new cordova_config_1.CordovaConfig(path.join(PROJECT_DIR, 'config.xml'));
            const { preferences = {} } = opts;
            const finalPreferences = Object.assign({}, DEFAULT_PREFERENCES, preferences);
            Object.keys(hooks).forEach((type) => {
                hooks[type].forEach((src) => {
                    cfg.addHook(type, path.relative(PROJECT_DIR, src));
                });
            });
            Object.keys(finalPreferences).forEach((key) => {
                cfg.setPreference(key, finalPreferences[key]);
            });
            return cfg.write();
        })
            .then(() => {
            process_state_1.processState.setStep(`${STEP_PREFIX}: (3/5) Adding platform`);
            return cordova_lib_1.cordova.platform('add', platforms);
        })
            .then(() => {
            process_state_1.processState.setStep(`${STEP_PREFIX}: (4/5) Adding plugins`);
            return cordova_lib_1.cordova.plugin('add', allPlugins);
        })
            .then(() => {
            process_state_1.processState.setStep(`${STEP_PREFIX}: (5/5) Preparing`);
            return cordova_lib_1.cordova.prepare({
                shell: {
                    app,
                    config,
                    processState: process_state_1.processState,
                    opts,
                },
            });
        })
            .then(() => PROJECT_DIR);
    });
}
function getProject(opts) {
    const cache = new cache_1.ProjectCacheManager(opts.cacheId);
    process_state_1.processState.setStep(STEP_PREFIX);
    const getCache = opts.skipCache ? Promise.resolve(null) : cache.getProject(opts.config);
    return getCache
        .then((projectPathOrNull) => {
        if (projectPathOrNull) {
            return exists(projectPathOrNull)
                .then((doesExists) => {
                if (!doesExists) {
                    return cache.deleteProject(opts.config)
                        .then(() => null);
                }
                return projectPathOrNull;
            });
        }
        return null;
    })
        .then((projectPathOrNull) => {
        if (projectPathOrNull) {
            process_state_1.processState.setSuccess('Found cached project for this config');
            chdir_1.chdir(projectPathOrNull);
            return cleanProject(projectPathOrNull)
                .then(() => projectPathOrNull);
        }
        const hash = cache_1.ProjectCacheManager.configToHash(opts.config);
        return createProject(opts, hash)
            .then(newProjectPath => cache.setProject(opts.config, newProjectPath)
            .then(() => {
            process_state_1.processState.setSuccess('Created cordova project');
            return newProjectPath;
        }));
    });
}
exports.getProject = getProject;
//# sourceMappingURL=project.js.map