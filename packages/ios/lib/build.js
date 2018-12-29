const build = require('@kano/kit-app-shell-cordova/lib/build');
const { collectPreference } = require('@kano/kit-app-shell-cordova/lib/preferences');
const processState = require('@kano/kit-app-shell-core/lib/process-state');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const path = require('path');
const fs = require('fs');
const platform = require('./platform');
const mkdirp = promisify(require('mkdirp'));

const rename = promisify(fs.rename);

const DEFAULT_PREFERENCES = {
    Scheme: 'kit-app',
    DisallowOverscroll: true,
};

function collectPreferences(opts) {
    opts.preferences = opts.preferences || {};
    collectPreference(opts, 'target-device', 'targetDevice');
    collectPreference(opts, 'deployment-target', 'deploymentTarget');
    collectPreference(opts, 'Scheme', 'scheme');
    opts.preferences = Object.assign({}, DEFAULT_PREFERENCES, opts.preferences);
}

module.exports = (opts) => {
    collectPreferences(opts);
    return build({
        ...opts,
        cacheId: 'ios',
        platforms: platform.platforms,
        plugins: platform.plugins,
        hooks: platform.hooks,
        targets: {
            safari: 10,
        },
        buildOpts: {
            options: {
                device: true,
            },
        },
    })
        .then((projectPath) => {
            const dest = path.join(projectPath, 'platforms/ios/build/device');
            return glob('*.ipa', { cwd: dest })
                .then((results) => {
                    const [result] = results;
                    if (!result) {
                        throw new Error('Could not find generated .ipa file');
                    }
                    const target = path.join(opts.out, result);
                    return mkdirp(opts.out)
                        .then(() => rename(path.join(dest, result), target))
                        .then(() => processState.setSuccess(`Built iOS app at ${target}`))
                        .then(() => target);
                });
        });
};
