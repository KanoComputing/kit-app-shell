const { processState } = require('@kano/kit-app-shell-common');
const { build } = require('@kano/kit-app-shell-windows');
const path = require('path');
const os = require('os');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const convertToWindowsStore = require('electron-windows-store');

function createAppx(dir, config, out) {
    const { WINDOWS_STORE } = config;
    if (!WINDOWS_STORE) {
        throw new Error('Could not create appx: Missing WINDOWS_STORE in config');
    }
    return convertToWindowsStore({
        containerVirtualization: false,
        inputDirectory: path.join(dir, `${config.APP_NAME}-win32-x64`),
        outputDirectory: out,
        packageVersion: `${config.UI_VERSION}.0`,
        packageName: WINDOWS_STORE.PACKAGE_NAME,
        packageDisplayName: WINDOWS_STORE.PACKAGE_DISPLAY_NAME,
        packageDescription: config.DESCRIPTION,
        packageExecutable: `app\\${config.APP_NAME}.exe`,
        publisher: WINDOWS_STORE.PUBLISHER,
        publisherDisplayName: WINDOWS_STORE.PUBLISHER_DISPLAY_NAME,
        deploy: false,
    });
}

function storeBuild({ app, config = {}, out }, commandOpts) {
    const TMP_DIR = path.join(os.tmpdir(), 'kash-windows-store-build');
    rimraf.sync(TMP_DIR);
    mkdirp.sync(TMP_DIR);
    return build({ app, config, out: TMP_DIR, skipInstaller: true }, commandOpts)
        .then(() => {
            processState.setStep(`Creating appx`);
            return createAppx(TMP_DIR, config, out);
        })
        .then(() => {
            processState.setSuccess('Created appx');
        });
}

module.exports = storeBuild;
