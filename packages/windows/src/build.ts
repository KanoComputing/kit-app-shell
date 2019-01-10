import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import { copy } from '@kano/kit-app-shell-core/lib/util/fs';
import build from '@kano/kit-app-shell-electron/lib/build';
import * as path from 'path';
import * as os from 'os';
import { promisify } from 'util';
import * as packager from 'electron-packager';
import { buildWin32Setup } from './innosetup';
import * as mkdirpCb from 'mkdirp';
import * as rimrafCb from 'rimraf';
import { WindowsBuildOptions } from './types';
import { IBuild } from '@kano/kit-app-shell-core/lib/types';

const mkdirp = promisify(mkdirpCb);
const rimraf = promisify(rimrafCb);

const INSTALLER_FILE = path.join(__dirname, '../installer.iss');

const DEFAULT_ICON = path.join(__dirname, '../icons/icon.ico');
const DEFAULT_INSTALLER_ICON = path.join(__dirname, '../icons/installer.bmp');
const DEFAULT_INSTALLER_BIG_ICON = path.join(__dirname, '../icons/installer-big.bmp');

function createInstaller(opts) {
    const {
        dir,
        app,
        config,
        out,
    } = opts;
    const installerIconFullPath = config.ICONS && config.ICONS.WINDOWS_INSTALLER
        ? path.resolve(app, config.ICONS.WINDOWS_INSTALLER) : DEFAULT_INSTALLER_ICON;
    const installerIconPath = path.relative(path.join(__dirname, '..'), installerIconFullPath);
    const installerLeftIconFullPath = config.ICONS && config.ICONS.WINDOWS_INSTALLER_BIG
        ? path.resolve(app, config.ICONS.WINDOWS_INSTALLER_BIG) : DEFAULT_INSTALLER_BIG_ICON;
    const installerLeftIconPath = path.relative(path.join(__dirname, '..'), installerLeftIconFullPath);
    const compilerOptions = {
        gui: false,
        verbose: false,
        definitions: {
            Version: config.UI_VERSION,
            Name: config.APP_NAME,
            WizardSmallImageFile: installerIconPath,
            WizardImageFile: installerLeftIconPath,
            // TODO: Generate installer name
            OutputName: 'kit-app-setup',
            OutputDir: out,
            Source: `${dir}\\${config.APP_NAME}-win32-x64\\*`,
            MinVersion: config.MIN_WINDOWS_VERSION || '10.0.15014',
        },
        iss: INSTALLER_FILE,
    };


    const builder = new Promise((resolve, reject) => {
        buildWin32Setup(compilerOptions, (e) => {
            if (e) {
                reject(new Error(`Installer build failed: ${e.message}`));
            }
            resolve();
        });
    });

    return builder;
}

const windowsBuild : IBuild =  function (opts : WindowsBuildOptions) {
    const {
        app,
        config,
        out,
        skipInstaller = false,
        tmpdir = os.tmpdir(),
    } = opts;
    const TMP_DIR = path.join(tmpdir, 'kash-windows-build');
    const BUILD_DIR = path.join(TMP_DIR, 'build');
    const PKG_DIR = path.join(TMP_DIR, 'app');
    const icon = config.ICONS && config.ICONS.WINDOWS ? path.join(app, config.ICONS.WINDOWS) : DEFAULT_ICON;
    return rimraf(TMP_DIR)
        .then(() => mkdirp(BUILD_DIR))
        .then(() => mkdirp(PKG_DIR))
        .then(() => build({
            ...opts,
            app,
            config,
            out: BUILD_DIR,
        }))
        // Add the vccorlib dll to the generated electron app
        .then(() => copy(
            path.join(__dirname, '../vccorlib140.dll'),
            path.join(BUILD_DIR, 'vccorlib140.dll'),
        ))
        .then(() => {
            processState.setInfo('Creating windows application');
            const targetDir = skipInstaller ? out : PKG_DIR;
            const packagerOptions = {
                dir: BUILD_DIR,
                packageManager: 'yarn',
                overwrite: true,
                out: targetDir,
                prune: true,
                // TODO: use asar package.
                // This does not work at the moment as it causes an issue with the PIXI loader
                // XHR maybe?
                asar: false,
                name: config.APP_NAME,
                platform: 'win32',
                arch: 'x64',
                win32metadata: {
                    CompanyName: config.MANUFACTURER,
                    FileDescription: config.APP_NAME,
                    ProductName: config.APP_NAME,
                },
                icon,
                quiet: false,
            };
            return packager(packagerOptions)
                .then(() => targetDir);
        })
        .then((pkgDir) => {
            processState.setSuccess('Created windows application');
            if (skipInstaller) {
                return out;
            }
            processState.setStep('Creating windows installer');
            return createInstaller({
                dir: pkgDir,
                app,
                config,
                out,
            })
                .then(() => {
                    processState.setSuccess('Created windows installer');
                    return out;
                });
        });
}

export default windowsBuild;
