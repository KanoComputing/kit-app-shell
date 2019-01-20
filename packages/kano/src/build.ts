import { copy, fromTemplate } from '@kano/kit-app-shell-core/lib/util/fs';
import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import { getBuildPath } from '@kano/kit-app-shell-core/lib/tmp';
import build from '@kano/kit-app-shell-electron/lib/build';
import * as path from 'path';
import * as glob from 'glob';
import * as fs from 'fs';
import snake = require('snake-case');
import * as kebab from 'dashify';
import * as mkdirpCb from 'mkdirp';
import * as rimrafCb from 'rimraf';
import * as packager from 'electron-packager';
import * as debian from 'debian-packaging';
import * as commandExists from 'command-exists';
import { KanoBuildOptions } from './types';
import { IBuild } from '@kano/kit-app-shell-core/lib/types';
import { promisify } from 'util';

const templateDir = path.join(__dirname, '../deb');

const rename = promisify(fs.rename);
const rimraf = promisify(rimrafCb);
const mkdirp = promisify(mkdirpCb);

/**
 * Create the control directory for the target .deb package
 * @param {String} out Target directory
 * @param {Object} config Config for the app
 */
function createControl(out, config) {
    let version = config.UI_VERSION;
    if (process.env.BUILD_NUMBER) {
        version += `-${process.env.BUILD_NUMBER}`;
    }
    // Create options for the templates
    const options = {
        VERSION: version,
        APP_NAME: config.APP_NAME,
        APP_DESCRIPTION: config.DESCRIPTION,
        KEBAB_NAME: kebab(config.APP_NAME),
        SNAKE_NAME: snake(config.APP_NAME),
    };
    // Create all the files from the templates
    return fromTemplate(
        path.join(templateDir, 'control'),
        path.join(out, 'control/control'),
        options,
    ).then(() => fromTemplate(
        path.join(templateDir, 'postinst'),
        path.join(out, 'control/postinst'),
        options,
        { mode: 0o555 },
    )).then(() => fromTemplate(
        path.join(templateDir, 'so.conf'),
        path.join(out, `data/etc/ld.so.conf.d/${options.KEBAB_NAME}.conf`),
        options,
    )).then(() => fromTemplate(
        path.join(templateDir, 'bin'),
        path.join(out, `data/usr/bin/${options.SNAKE_NAME}`),
        options,
        { mode: 0o555 },
    ));
}

function copyExtra(app, out, config) {
    // Safely ignore icons is not present
    if (!config.KANO_OS || !config.KANO_OS.APPS) {
        return Promise.resolve();
    }
    const appsPath = path.join(app, config.KANO_OS.APPS);
    const iconsPath = path.join(out, 'data/usr/share/icons/Kano/88x88/apps');
    const desktopIconsPath = path.join(out, 'data/usr/share/kano-desktop/icons');
    const appsTargetPath = path.join(out, 'data/usr/share/applications');
    return mkdirp(iconsPath)
        .then(() => mkdirp(desktopIconsPath))
        .then(() => mkdirp(appsTargetPath))
        .then(() => {
            const icons = glob.sync('*.png', { cwd: appsPath, nodir: true });
            const apps = glob.sync('*.app', { cwd: appsPath, nodir: true });
            // Copy icons to the icons share
            const tasks = icons.map((icon) => copy(
                path.join(appsPath, icon),
                path.join(iconsPath, icon),
            ));
            // Copy icons to the desktop share
            tasks.concat(icons.map((icon) => copy(
                path.join(appsPath, icon),
                path.join(desktopIconsPath, icon),
            )));
            tasks.concat(apps.map((a) => copy(
                path.join(appsPath, a),
                path.join(appsTargetPath, a),
            )));
            return Promise.all(tasks);
        });
}

function createDeb(dir, out, config) {
    return debian.createPackage({
        control: path.join(dir, 'control'),
        data: path.join(dir, 'data'),
        dest: path.join(out, `${kebab(config.APP_NAME)}.deb`),
    });
}

function checkCmd(cmd) {
    return new Promise((resolve, reject) => {
        commandExists(cmd, (err, exists) => {
            if (err) {
                return reject(err);
            }
            if (!exists) {
                return reject(new Error(`Could not package app: command '${cmd}' missing`));
            }
            return resolve();
        });
    });
}

function checkEnv(skipAr = false) : Promise<null> {
    // No check if last packaging step is skipped
    if (skipAr) {
        return Promise.resolve(null);
    }
    return checkCmd('tar')
        .then(() => checkCmd('ar'))
        .then(() => null);
}

const kanoBuild : IBuild = (opts : KanoBuildOptions) => {
    const {
        app,
        config,
        out,
        bundleOnly,
    } = opts;
    const TMP_DIR = path.join(getBuildPath(), 'kano');
    const BUILD_DIR = path.join(TMP_DIR, 'build');
    const APP_DIR = path.join(TMP_DIR, 'app');
    const skipAr = opts['skip-ar'];
    // The debian root will depend on whether the debian package will be generated or not
    const DEB_DIR = skipAr ? out : path.join(TMP_DIR, 'deb');
    const APP_RESOURCES_DIR = path.join(DEB_DIR, 'data/usr/share');
    const appName = snake(config.APP_NAME);
    // Bundle app in tmp dir
    return checkEnv(skipAr)
        // Override dest dir
        .then(() => rimraf(out))
        .then(() => rimraf(TMP_DIR))
        .then(() => mkdirp(BUILD_DIR))
        .then(() => mkdirp(APP_DIR))
        .then(() => mkdirp(DEB_DIR))
        .then(() => build({
            app,
            config,
            out: BUILD_DIR,
            bundleOnly,
            bundle: {
                // Ship noble-mac binaries
                patterns: [
                    'node_modules/bluetooth-hci-socket/**/*',
                ],
                forcePlatform: 'linux',
                ignore: ['bluetooth-hci-socket'],
            },
        }))
        .then((buildOut) => {
            processState.setInfo('Creating linux app');
            // Create executable for linux using electron-packager
            const packagerOptions = {
                dir: buildOut,
                packageManager: 'yarn',
                overwrite: true,
                out: APP_DIR,
                prune: false,
                name: appName,
                platform: 'linux',
                arch: 'armv7l',
                quiet: false,
            };
            return packager(packagerOptions)
                .then(() => APP_DIR);
        })
        .then((pkgDir) => {
            const appDir = path.resolve(pkgDir, `${appName}-linux-armv7l`);
            const resourcesDir = path.join(appDir, 'resources/app');
            const SNAPSHOT_BLOB = 'snapshot_blob.bin';
            const V8_CONTEXT_SNAPSHOT = 'v8_context_snapshot.bin';
            // Move the snapshot files to the root of the generated app
            return rename(path.join(resourcesDir, SNAPSHOT_BLOB), path.join(appDir, SNAPSHOT_BLOB))
                .then(() => rename(
                    path.join(resourcesDir, V8_CONTEXT_SNAPSHOT),
                    path.join(appDir,  V8_CONTEXT_SNAPSHOT),
                ))
                // Delete the electron directory, it was needed during packaaging, but must not be shipped
                .then(() => rimraf(path.join(resourcesDir, 'node_modules/electron')))
                .then(() => pkgDir);
        })
        .then((appDir) => {
            return mkdirp(APP_RESOURCES_DIR)
                // Move the generated linux app to the debian structure
                .then(() => rename(
                    path.join(appDir, `${appName}-linux-armv7l`),
                    path.join(APP_RESOURCES_DIR, kebab(config.APP_NAME)),
                ))
                .then(() => {
                    processState.setSuccess('Created linux app');
                    processState.setStep('Preparing debian package');
                    // Create structure and files for debian package
                    const tasks = [
                        createControl(DEB_DIR, config),
                        copyExtra(app, DEB_DIR, config),
                    ];
                    return Promise.all(tasks as Array<Promise<void>>).then(() => DEB_DIR);
                });
        })
        .then((dir) => {
            processState.setSuccess('Debian package ready');
            if (skipAr) {
                return null;
            }
            processState.setStep('Creating .deb file');
            // Create .deb file from debian structure
            return createDeb(dir, out, config)
                .then(() => processState.setSuccess('Created .deb file'));
        });
};

export default kanoBuild;
