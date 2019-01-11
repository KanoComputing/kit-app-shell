import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import build from '@kano/kit-app-shell-windows/lib/build';
import * as path from 'path';
import * as os from 'os';
import { promisify } from 'util';
import chalk from 'chalk';
import * as convertToWindowsStore from 'electron-windows-store';
import * as mkdirpCb from 'mkdirp';
import * as rimrafCb from 'rimraf';
import { generateIcons, filenameFromIconKey, deleteDefaultIcons } from './icons';
import { AppXManifest } from './manifest';
import { IBuild } from '@kano/kit-app-shell-core/lib/types';
import { WindowsStoreBuildOptions } from './types';

const mkdirp = promisify(mkdirpCb);
const rimraf = promisify(rimrafCb);

const TMP_DIRNAME = 'kash-windows-store-build';

/**
 * Updates the appx manifest and generates the appx icons
 * @param root Path to the root of the pre-appx directory
 * @param src Source image for the icons generation
 */
function updateAppx(root : string, app : string, src? : string) : Promise<void> {
    // Skip icon generation if no src is provided
    if (!src) {
        return Promise.resolve();
    }
    return deleteDefaultIcons(root)
        .then(() => generateIcons(root, src))
        .then(() => {
            // Retrieve the appxmanifest file
            const manifestPath = path.join(root, 'AppXManifest.xml');
            const manifest = new AppXManifest(manifestPath);
            return manifest.open()
                .then(() => {
                    // Update all known icons adn tiles
                    manifest.setLogo(app, 'Square150x150Logo', path.join('assets', filenameFromIconKey('Square150x150Logo')));
                    manifest.setLogo(app, 'Square44x44Logo', path.join('assets', filenameFromIconKey('Square44x44Logo')));
                    manifest.setDefaultTile(app, 'Wide310x150Logo', path.join('assets', filenameFromIconKey('Wide310x150Logo')));
                    manifest.setDefaultTile(app, 'Square310x310Logo', path.join('assets', filenameFromIconKey('Square310x310Logo')));
                    manifest.setDefaultTile(app, 'Square71x71Logo', path.join('assets', filenameFromIconKey('Square71x71Logo')));
                    manifest.setMainLogo(path.join('assets', filenameFromIconKey('Square50x50Logo')));
                    return manifest.write();
                });
        });
}

const windowsStoreBuild : IBuild = (opts : WindowsStoreBuildOptions) => {
    const {
        app,
        config,
        out,
        certificates,
        tmpdir = os.tmpdir(),
    } = opts;
    const { WINDOWS_STORE } = config;
    let devCert = opts.devCert;
    if (!devCert) {
        if (!WINDOWS_STORE) {
            throw new Error('Could not create appx: Missing \'WINDOWS_STORE\' in config');
        }
        if (!WINDOWS_STORE.PUBLISHER) {
            throw new Error('Could not create appx: Missing \'PUBLISHER\' in \'WINDOWS_STORE\' config');
        }
        if (!certificates || !certificates[WINDOWS_STORE.PUBLISHER]) {
            throw new Error(`Could not create appx: Missing certificates in rc.\n    Run ${chalk.cyan('kash configure windows-store')} and input certificate ${chalk.blue(WINDOWS_STORE.PUBLISHER)} when requested to fix this.`);
        }
        devCert = certificates[WINDOWS_STORE.PUBLISHER];
    }
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
            const icon : string|null = config.ICONS && config.ICONS.WINDOWS_STORE ? path.join(app, config.ICONS.WINDOWS_STORE) : null;
            if (icon === null) {
                processState.setWarning('Missing \'ICONS.WINDOWS_STORE\' in config, will use default icon');
            }
            processState.setStep('Creating appx');
            // Create the .appx from the bundled app
            return convertToWindowsStore({
                containerVirtualization: false,
                inputDirectory: path.join(buildDir, `${config.APP_NAME}-win32-x64`),
                outputDirectory: out,
                packageVersion: `${config.UI_VERSION}.0`,
                packageName: WINDOWS_STORE.PACKAGE_NAME,
                packageDisplayName: WINDOWS_STORE.PACKAGE_DISPLAY_NAME,
                packageDescription: config.APP_DESCRIPTION,
                packageExecutable: `app\\${config.APP_NAME}.exe`,
                publisher: WINDOWS_STORE.PUBLISHER,
                publisherDisplayName: WINDOWS_STORE.PUBLISHER_DISPLAY_NAME,
                windowsKit: opts.windowsKit,
                devCert,
                deploy: false,
                finalSay() {
                    const preAppx = path.join(out, 'pre-appx');
                    return updateAppx(preAppx, WINDOWS_STORE.PACKAGE_NAME, icon);
                }
            }).then(() => out);
        })
        .then((outDir) => {
            processState.setSuccess('Created appx');
            return outDir;
        });
};

export default windowsStoreBuild;
