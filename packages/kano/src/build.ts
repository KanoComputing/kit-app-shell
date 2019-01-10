import { copy, fromTemplate } from '@kano/kit-app-shell-core/lib/util/fs';
import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import build from '@kano/kit-app-shell-electron/lib/build';
import * as path from 'path';
import * as os from 'os';
import * as glob  from 'glob';
import * as fs  from 'fs';
import snake = require('snake-case');
import * as kebab from 'dashify';
import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';
import * as packager from 'electron-packager';
import * as debian from 'debian-packaging';
import * as commandExists from 'command-exists';
import { KanoBuildOptions } from './options';
import { IBuild } from '@kano/kit-app-shell-core/lib/types';

const templateDir = path.join(__dirname, '../deb');

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
    mkdirp.sync(iconsPath);
    mkdirp.sync(desktopIconsPath);
    mkdirp.sync(appsTargetPath);
    const icons = glob.sync('*.png', { cwd: appsPath, nodir: true });
    const apps = glob.sync('*.app', { cwd: appsPath, nodir: true });
    // Copy icons to the icons share
    const tasks = icons.map(icon => copy(
        path.join(appsPath, icon),
        path.join(iconsPath, icon),
    ));
    // Copy icons to the desktop share
    tasks.concat(icons.map(icon => copy(
        path.join(appsPath, icon),
        path.join(desktopIconsPath, icon),
    )));
    tasks.concat(apps.map(a => copy(
        path.join(appsPath, a),
        path.join(appsTargetPath, a),
    )));
    return Promise.all(tasks);
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

function checkEnv(skipAr = false) : Promise<void> {
    // No check if last packaging step is skipped
    if (skipAr) {
        return Promise.resolve();
    }
    return checkCmd('tar')
        .then(() => checkCmd('ar'))
        .then(() => null);
}

const kanoBuild : IBuild = function (opts : KanoBuildOptions) {
    const {
        app,
        config,
        out,
        bundleOnly,
    } = opts;
    const TMP_DIR = path.join(opts.tmpdir || os.tmpdir(), 'kash-kano-build');
    const BUILD_DIR = path.join(TMP_DIR, 'build');
    const APP_DIR = path.join(TMP_DIR, 'app');
    const DEB_DIR = path.join(TMP_DIR, 'deb');
    const APP_RESOURCES_DIR = path.join(DEB_DIR, 'data/usr/share');
    rimraf.sync(TMP_DIR);
    mkdirp.sync(BUILD_DIR);
    mkdirp.sync(APP_DIR);
    mkdirp.sync(DEB_DIR);
    const appName = snake(config.APP_NAME);
    const skipAr = opts['skip-ar'];
    return checkEnv(skipAr)
        // Bundle app in tmp dir
        .then(() => build({
            app,
            config,
            out: BUILD_DIR,
            bundleOnly,
        }))
        .then((buildOut) => {
            processState.setInfo('Creating linux app');
            // Create executable for linux using electron-packager
            const packagerOptions = {
                dir: buildOut,
                packageManager: 'yarn',
                overwrite: true,
                out: APP_DIR,
                prune: true,
                // TODO: use asar package.
                // This does not work at the moment as it causes an issue with the PIXI loader
                // XHR maybe?
                asar: false,
                name: appName,
                platform: 'linux',
                arch: 'armv7l',
                quiet: true,
            };
            return packager(packagerOptions)
                .then(() => APP_DIR);
        })
        .then((appDir) => {
            // Move the generated linux app to the debian structure
            mkdirp.sync(APP_RESOURCES_DIR);
            fs.renameSync(
                path.join(appDir, `${appName}-linux-armv7l`),
                path.join(APP_RESOURCES_DIR, kebab(config.APP_NAME)),
            );
            processState.setSuccess('Created linux app');
            processState.setStep('Preparing debian package');
            const targetDir = skipAr ? out : DEB_DIR;
            // Create structure and files for debian package
            const tasks = [
                createControl(targetDir, config),
                copyExtra(app, targetDir, config),
            ];
            return Promise.all(tasks as Array<Promise<void>>).then(() => targetDir);
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
}

export default kanoBuild;
