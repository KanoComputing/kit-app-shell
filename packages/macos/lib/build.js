const { processState } = require('@kano/kit-app-shell-common');
const { build } = require('@kano/kit-app-shell-electron');
const path = require('path');
const os = require('os');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const packager = require('electron-packager');

function macosBuild({ app, config = {}, out }, commandOpts) {
    const TMP_DIR = path.join(os.tmpdir(), 'kash-macos-build');
    rimraf.sync(TMP_DIR);
    mkdirp.sync(TMP_DIR);
    return build({ app, config, out: TMP_DIR }, commandOpts)
        .then(() => {
            processState.setStep('Creating macOS app');
            const packagerOptions = {
                dir: TMP_DIR,
                packageManager: 'yarn',
                overwrite: true,
                out,
                prune: true,
                // TODO: use asar package. This does not work at the moment as it causes an issue with the PIXI loader
                // XHR maybe?
                asar: false,
                name: config.APP_NAME,
                platform: 'darwin',
                arch: 'x64',
                icon: path.join(app, config.ICONS.MACOS),
                quiet: true,
                mac: true,
            };
            return packager(packagerOptions);
        })
        .then(() => {
            processState.setSuccess('Created macOS app');
        });
}

module.exports = macosBuild;
