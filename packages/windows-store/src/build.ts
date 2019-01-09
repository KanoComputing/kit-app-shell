import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import build from '@kano/kit-app-shell-windows/lib/build';
import * as path from 'path';
import * as os from 'os';
import { promisify } from 'util';
import chalk from 'chalk';
import * as convertToWindowsStore from 'electron-windows-store';
import * as mkdirpCb from 'mkdirp';
import * as rimrafCb from 'rimraf';

const mkdirp = promisify(mkdirpCb);
const rimraf = promisify(rimrafCb);

const TMP_DIRNAME = 'kash-windows-store-build';

export default (opts) => {
    const {
        app,
        config = {},
        out,
        certificates,
        windowsKit,
        tmpdir = os.tmpdir(),
    } = opts;
    const { WINDOWS_STORE } = config;
    if (!WINDOWS_STORE) {
        throw new Error('Could not create appx: Missing \'WINDOWS_STORE\' in config');
    }
    if (!WINDOWS_STORE.PUBLISHER) {
        throw new Error('Could not create appx: Missing \'PUBLISHER\' in \'WINDOWS_STORE\' config');
    }
    if (!windowsKit || !certificates || !certificates[WINDOWS_STORE.PUBLISHER]) {
        throw new Error(`Could not create appx: Missing certificates in rc.\n    Run ${chalk.cyan('kash config windows-store')} and input certificate ${chalk.blue(WINDOWS_STORE.PUBLISHER)} when requested to fix this.`);
    }
    const devCert = certificates[WINDOWS_STORE.PUBLISHER];
    // Force disable updater
    Object.assign(config, { UPDATER_DISABLED: true });
    // This is read by electron-windows-store to make logs silent
    // @ts-ignore
    global.isModuleUse = true;
    const TMP_DIR = path.join(tmpdir, TMP_DIRNAME);
    // Prepare a temp directory for the build
    return rimraf(TMP_DIR)
        .then(() => mkdirp(TMP_DIR))
        .then(() =>
            // Build using the windows platform, skip the installer as we will create an .appx
            build({
                ...opts,
                app,
                out: TMP_DIR,
                skipInstaller: true,
            }))
        .then((buildDir) => {
            processState.setStep('Creating appx');
            // Create the .appx from the bundled app
            return convertToWindowsStore({
                containerVirtualization: false,
                inputDirectory: path.join(buildDir, `${config.APP_NAME}-win32-x64`),
                outputDirectory: out,
                packageVersion: `${config.UI_VERSION}.0`,
                packageName: WINDOWS_STORE.PACKAGE_NAME,
                packageDisplayName: WINDOWS_STORE.PACKAGE_DISPLAY_NAME,
                packageDescription: config.DESCRIPTION,
                packageExecutable: `app\\${config.APP_NAME}.exe`,
                publisher: WINDOWS_STORE.PUBLISHER,
                publisherDisplayName: WINDOWS_STORE.PUBLISHER_DISPLAY_NAME,
                windowsKit,
                devCert,
                deploy: false,
            }).then(() => out);
        })
        .then((outDir) => {
            processState.setSuccess('Created appx');
            return outDir;
        });
};
