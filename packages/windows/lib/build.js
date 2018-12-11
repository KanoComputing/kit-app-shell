const { processState } = require('@kano/kit-app-shell-core');
const { build } = require('@kano/kit-app-shell-electron');
const path = require('path');
const os = require('os');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const packager = require('electron-packager');
const buildInnosetup = require('./innosetup');

const INSTALLER_FILE = path.join(__dirname, '../installer.iss');

const DEFAULT_ICON = path.join(__dirname, '../icons/icon.ico');
const DEFAULT_INSTALLER_ICON = path.join(__dirname, '../icons/installer.bmp');
const DEFAULT_INSTALLER_BIG_ICON = path.join(__dirname, '../icons/installer-big.bmp');

function createInstaller({ dir, app, config, out }) {
    const installerIconFullPath = config.ICONS && config.ICONS.WINDOWS_INSTALLER ? path.resolve(app, config.ICONS.WINDOWS_INSTALLER) : DEFAULT_INSTALLER_ICON;
    const installerIconPath = path.relative(path.join(__dirname, '..'), installerIconFullPath);
    const installerLeftIconFullPath = config.ICONS && config.ICONS.WINDOWS_INSTALLER_BIG ? path.resolve(app, config.ICONS.WINDOWS_INSTALLER_BIG) : DEFAULT_INSTALLER_BIG_ICON;
    const installerLeftIconPath = path.relative(path.join(__dirname, '..'), installerLeftIconFullPath);
    let compilerOptions = {
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


    const build = new Promise((resolve, reject) => {
        buildInnosetup(compilerOptions, (e) => {
            if (e) {
                reject(new Error(`Installer build failed: ${e.message}`));
            }
            resolve();
        });
    });

    return build;
}

function windowsBuild({ app, config = {}, out, skipInstaller = false, bundleOnly }, commandOpts) {
    const TMP_DIR = path.join(os.tmpdir(), 'kash-windows-build');
    const BUILD_DIR = path.join(TMP_DIR, 'build');
    const PKG_DIR = path.join(TMP_DIR, 'app');
    rimraf.sync(TMP_DIR);
    mkdirp.sync(BUILD_DIR);
    mkdirp.sync(PKG_DIR);
    const icon = config.ICONS ? config.ICONS.WINDOWS : DEFAULT_ICON;
    return build({ app, config, out: BUILD_DIR, bundleOnly }, commandOpts)
        .then((buildDir) => {
            processState.setStep(`Creating windows application`);
            const targetDir = skipInstaller ? out : PKG_DIR;
            const packagerOptions = {
                dir: buildDir,
                packageManager: 'yarn',
                overwrite: true,
                out: targetDir,
                prune: true,
                // TODO: use asar package. This does not work at the moment as it causes an issue with the PIXI loader
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
                quiet: true,
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

module.exports = windowsBuild;
