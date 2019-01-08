"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const build_1 = require("@kano/kit-app-shell-cordova/lib/build");
const preferences_1 = require("@kano/kit-app-shell-cordova/lib/preferences");
const process_state_1 = require("@kano/kit-app-shell-core/lib/process-state");
const platform = require("./platform");
const util_1 = require("util");
const globCb = require("glob");
const mkdirpCb = require("mkdirp");
const path = require("path");
const fs = require("fs");
const mkdirp = util_1.promisify(mkdirpCb);
const glob = util_1.promisify(globCb);
const rename = util_1.promisify(fs.rename);
const DEFAULT_PREFERENCES = {
    'android-targetSdkVersion': 28,
};
function collectPreferences(opts) {
    opts.preferences = opts.preferences || {};
    preferences_1.collectPreference(opts, 'android-minSdkVersion', 'minSdkVersion');
    preferences_1.collectPreference(opts, 'android-maxSdkVersion', 'maxSdkVersion');
    preferences_1.collectPreference(opts, 'android-targetSdkVersion', 'targetSdkVersion');
    opts.preferences = Object.assign({}, DEFAULT_PREFERENCES, opts.preferences);
}
exports.default = (opts) => {
    collectPreferences(opts);
    return build_1.default(Object.assign({}, opts, { cacheId: 'android', platforms: platform.platforms, plugins: platform.plugins, hooks: platform.hooks, targets: {
            chrome: 53,
        }, clean: ['platforms/android/app/build/outputs/apk'] }))
        .then((projectPath) => {
        const dest = path.join(projectPath, 'platforms/android/app/build/outputs/apk');
        return glob('**/*.apk', { cwd: dest })
            .then((results) => {
            const [result] = results;
            if (!result) {
                throw new Error('Could not find generated .apk file');
            }
            const target = path.join(opts.out, path.basename(result));
            return mkdirp(opts.out)
                .then(() => rename(path.join(dest, result), target))
                .then(() => process_state_1.processState.setSuccess(`Built android app at ${target}`))
                .then(() => target);
        });
    });
};
//# sourceMappingURL=build.js.map