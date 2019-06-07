import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import { getBuildPath } from '@kano/kit-app-shell-core/lib/tmp';
import build from '@kano/kit-app-shell-windows/lib/build';
import * as path from 'path';
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

const TMP_DIRNAME = 'windows-store';

function updateIcons(root : string, appName : string, config? : { [K : string] : string }) {
    // Retrieve the appxmanifest file
    const manifestPath = path.join(root, 'AppXManifest.xml');
    const manifest = new AppXManifest(manifestPath);
    return manifest.open()
        .then(() => {
            manifest.createSplashScreen(appName);
            // Update all known icons and tiles
            if (config.TILE_BACKGROUND) {
                manifest.setLogo(appName, 'BackgroundColor', config.TILE_BACKGROUND);
            }
            if (config.SPLASH_SCREEN_BACKGROUND) {
                manifest.setSplashScreenAttribute(appName, 'BackgroundColor', config.SPLASH_SCREEN_BACKGROUND);
            }
            manifest.setSplashScreenAttribute(
                appName, 'Image', path.join('assets', filenameFromIconKey('SPLASH_SCREEN')));
            manifest.setLogo(appName, 'Square150x150Logo', path.join('assets', filenameFromIconKey('MEDIUM_TILE')));
            manifest.setLogo(appName, 'Square44x44Logo', path.join('assets', filenameFromIconKey('APP_ICON')));
            manifest.setDefaultTile(appName, 'Square71x71Logo', path.join('assets', filenameFromIconKey('SMALL_TILE')));
            manifest.setDefaultTile(
                appName, 'Square310x310Logo', path.join('assets', filenameFromIconKey('LARGE_TILE')));
            manifest.setDefaultTile(appName, 'Wide310x150Logo', path.join('assets', filenameFromIconKey('WIDE_TILE')));
            manifest.setMainLogo(path.join('assets', filenameFromIconKey('PACKAGE_LOGO')));
            return manifest.write();
        });
}

/**
 * Updates the appx manifest and generates the appx icons
 * @param root Path to the root of the pre-appx directory
 * @param src Source image for the icons generation
 */
function updateAppx(
    root : string,
    app : string,
    appName : string,
    icon? : string,
    config? : { [K : string] : string },
) : Promise<void> {
    // Skip icon generation if no src is provided
    if (!icon) {
        return Promise.resolve();
    }
    return deleteDefaultIcons(path.join(root, 'assets'))
        .then(() => generateIcons(path.join(root, 'assets'), app, icon, config || {}))
        .then(() => updateIcons(root, appName, config || {}));
}

const windowsStoreBuild : IBuild = (opts : WindowsStoreBuildOptions) => {
    const {
        app,
        config,
        out,
        certificates,
    } = opts;
    const { WINDOWS_STORE = {} } = config;
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
    const TMP_DIR = path.join(getBuildPath(), TMP_DIRNAME);
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
                // packaged UWP apps don't work with a V8 snapshot ¯\_(ツ)_/¯
                disableV8Snapshot: true,
            }))
        .then((buildDir) => {
            const icon : string|null = config.ICONS && config.ICONS.WINDOWS_STORE
                ? config.ICONS.WINDOWS_STORE : null;
            if (icon === null) {
                processState.setWarning('Missing \'ICONS.WINDOWS_STORE\' in config, will use default icon');
            }
            processState.setStep('Creating appx');
            const program = {
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
            };
            // Create the .appx from the bundled app
            return convertToWindowsStore(Object.assign({}, program, {
                finalSay() {
                    const preAppx = path.join(out, 'pre-appx');
                    return updateAppx(preAppx, app, WINDOWS_STORE.PACKAGE_NAME || '', icon || '', WINDOWS_STORE);
                },
            })).then(() => out);
        })
        .then((outDir) => {
            processState.setSuccess('Created appx');
            return outDir;
        });
};

export default windowsStoreBuild;
