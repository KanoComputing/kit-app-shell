const processState = require('@kano/kit-app-shell-core/lib/process-state');
const build = require('@kano/kit-app-shell-windows/lib/build');
const path = require('path');
const os = require('os');
const { promisify } = require('util');
const mkdirp = promisify(require('mkdirp'));
const rimraf = promisify(require('rimraf'));
const convertToWindowsStore = require('electron-windows-store');

function createAppx(dir, config, out) {
    // Extract the windows store config from the provided config
    // It contains essential information that cannot have a default or be infered
    // throw an error if it is missing
    // TODO: Check all required keys before continuing. This would provide explicit errors
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
    }).then(() => out);
}

module.exports = ({ app, config = {}, out, bundleOnly }) => {
    // Prepare a temp directory for the build
    const TMP_DIR = path.join(os.tmpdir(), 'kash-windows-store-build');
    return rimraf(TMP_DIR)
        .then(() => mkdirp(TMP_DIR))
        .then(() => {
            // Build using the windows platform, skip the installer as we will create an .appx
            return build({
                app,
                config,
                out: TMP_DIR,
                skipInstaller: true,
                bundleOnly,
            });
        })
        .then((buildDir) => {
            processState.setStep(`Creating appx`);
            // Create the .appx from the bundled app
            return createAppx(buildDir, config, out);
        })
        .then((outDir) => {
            processState.setSuccess('Created appx');
            return outDir;
        });
}
