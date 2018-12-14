const { build } = require('@kano/kit-app-shell-cordova');
const plugins = require('./plugins');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const path = require('path');
const fs = require('fs');
const mkdirp = promisify(require('mkdirp'));
const rimraf = promisify(require('rimraf'));

const rename = promisify(fs.rename);

module.exports = (opts, commandOpts) => {
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
        }, commandOpts)
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
                        .then(() => target);
                });
        });
};
