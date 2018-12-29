const build = require('@kano/kit-app-shell-cordova/lib/build');
const { collectPreference } = require('@kano/kit-app-shell-cordova/lib/preferences');
const processState = require('@kano/kit-app-shell-core/lib/process-state');
const plugins = require('./plugins');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const path = require('path');
const fs = require('fs');
const mkdirp = promisify(require('mkdirp'));

const rename = promisify(fs.rename);

const DEFAULT_PREFERENCES = {
    'android-targetSdkVersion': 28,
};

function collectPreferences(opts) {
    opts.preferences = opts.preferences || {};
    collectPreference(opts, 'android-minSdkVersion', 'minSdkVersion');
    collectPreference(opts, 'android-maxSdkVersion', 'maxSdkVersion');
    collectPreference(opts, 'android-targetSdkVersion', 'targetSdkVersion');
    opts.preferences = Object.assign({}, DEFAULT_PREFERENCES, opts.preferences);
}

module.exports = (opts) => {
    collectPreferences(opts);
    return build({
        ...opts,
        cacheId: 'android',
        platforms: plugins.platforms,
        plugins: plugins.plugins,
        hooks: plugins.hooks,
        targets: {
            chrome: 53,
        },
        clean: ['platforms/android/app/build/outputs/apk'],
    })
    .then((projectPath) => {
        // Find the generated apk
        const dest = path.join(projectPath, 'platforms/android/app/build/outputs/apk');
        return glob('**/*.apk', { cwd: dest })
            .then((results) => {
                const [result] = results;
                if (!result) {
                    throw new Error('Could not find generated .apk file');
                }
                // Move the generated apk to the out directory
                const target = path.join(opts.out, path.basename(result));
                // Ensure the directory exists
                return mkdirp(opts.out)
                    .then(() => rename(path.join(dest, result), target))
                    .then(() => processState.setSuccess(`Built android app at ${target}`))
                    .then(() => target);
            });
    });
};
