const { build } = require('@kano/kit-app-shell-cordova');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const path = require('path');
const fs = require('fs');
const platform = require('./platform');
const mkdirp = promisify(require('mkdirp'));

const rename = promisify(fs.rename);

module.exports = (opts, commandOpts) => {
    return build({
        ...opts,
        cacheId: 'ios',
        platforms: platform.platforms,
        plugins: platform.plugins,
        hooks: platform.hooks,
        targets: {
            safari: 10,
        },
    }, commandOpts)
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
                        .then(() => target);
                });
        });
};
