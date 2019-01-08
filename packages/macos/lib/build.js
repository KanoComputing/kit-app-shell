const { processState } = require('@kano/kit-app-shell-core/lib/process-state');
const build = require('@kano/kit-app-shell-electron/lib/build');
const path = require('path');
const os = require('os');
const packager = require('electron-packager');
const { promisify } = require('util');
const mkdirp = promisify(require('mkdirp'));
const rimraf = promisify(require('rimraf'));

const defaultIconPath = path.join(__dirname, '../icons/1024.png.icns');

function macosBuild(opts) {
    const {
        app,
        config = {},
        out,
        bundleOnly,
        tmpdir = os.tmpdir(),
    } = opts;
    const warnings = [];
    const TMP_DIR = path.join(tmpdir, 'kash-macos-build');
    const icon = config.ICONS && config.ICONS.MACOS ?
        path.join(app, config.ICONS.MACOS) : defaultIconPath;
    let name = config.APP_NAME;
    if (!config.APP_NAME) {
        warnings.push('\'APP_NAME\' missing in config, will use \'App\' as name');
        name = 'App';
    }
    return rimraf(TMP_DIR)
        .then(() => mkdirp(TMP_DIR))
        .then(() => build({
            app,
            config,
            out: TMP_DIR,
            bundleOnly,
        }))
        .then((buildDir) => {
            processState.setInfo('Creating macOS app');
            const packagerOptions = {
                dir: buildDir,
                packageManager: 'yarn',
                overwrite: true,
                out,
                prune: true,
                // TODO: use asar package.
                // This does not work at the moment as it causes an issue with the PIXI loader
                // XHR maybe?
                asar: false,
                name,
                platform: 'darwin',
                arch: 'x64',
                icon,
                quiet: false,
                mac: true,
            };
            return packager(packagerOptions);
        })
        .then(() => {
            warnings.forEach(w => processState.setWarning(w));
            processState.setSuccess('Created macOS app');
            return out;
        });
}

module.exports = macosBuild;
