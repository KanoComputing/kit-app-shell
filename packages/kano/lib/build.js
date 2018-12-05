const { processState, copy } = require('@kano/kit-app-shell-common');
const { build } = require('@kano/kit-app-shell-electron');
const path = require('path');
const os = require('os');
const glob = require('glob');
const fs = require('fs');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const packager = require('electron-packager');
const debian = require('debian-packaging');
const commandExists = require('command-exists');

function fileFromTemplate(tmpPath, dest, options, writeOpts) {
    const contents = fs.readFileSync(tmpPath).toString();
    const newContents = contents.replace(/\$\{(.*?)\}/g, (match, g1) => {
        return options[g1] || '';
    });
    fs.writeFileSync(dest, newContents, writeOpts);
}

function kebab(name) {
    return name.toLowerCase().replace(/ /g, '-').replace(/(-)\1+/, '-');
}
function underscore(name) {
    return name.replace(/ /g, '_');
}

const templateDir = path.join(__dirname, '../deb');

function createControl(out, config) {
    let version = config.UI_VERSION;
    if (process.env.BUILD_NUMBER) {
        version += `-${process.env.BUILD_NUMBER}`;
    }
    const options = {
        VERSION: version,
        APP_NAME: config.APP_NAME,
        APP_DESCRIPTION: config.DESCRIPTION,
        KEBAB_NAME: kebab(config.APP_NAME),
        UNDERSCORE_NAME: underscore(config.APP_NAME),
    };
    path.join(out, 'control/control')
    path.join(out, 'control/postinst')
    mkdirp.sync(path.join(out, 'control'));
    fileFromTemplate(
        path.join(templateDir, 'control'),
        path.join(out, 'control/control'),
        options,
    );
    fileFromTemplate(
        path.join(templateDir, 'postinst'),
        path.join(out, 'control/postinst'),
        options,
        { mode: 0o555 },
    );
    mkdirp.sync(path.join(out, 'data/etc'));
    mkdirp.sync(path.join(out, 'data/etc/ld.so.conf.d'));
    fileFromTemplate(
        path.join(templateDir, 'so.conf'),
        path.join(out, `data/etc/ld.so.conf.d/${options.KEBAB_NAME}.conf`),
        options,
    );
    mkdirp.sync(path.join(out, 'data/usr/bin'));
    fileFromTemplate(
        path.join(templateDir, 'bin'),
        path.join(out, 'data/usr/bin/kit-app'),
        options,
        { mode: 0o555 },
    );
    // TODO: Make the whole function async for perf
    return Promise.resolve();
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
    const tasks = icons.map(icon => copy(path.join(appsPath, icon), path.join(iconsPath, icon)));
    // Copy icons to the desktop share
    tasks.concat(icons.map(icon => copy(path.join(appsPath, icon), path.join(desktopIconsPath, icon))));
    tasks.concat(apps.map(app => copy(path.join(appsPath, app), path.join(appsTargetPath, app))));
    return Promise.all(tasks);
}

function createDeb(dir, out, config) {
    path.join(dir, 'control')
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

function checkEnv(skipAr = false) {
    // No check if last packaging step is skipped
    if (skipAr) {
        return Promise.resolve();
    }
    return checkCmd('tar')
        .then(() => checkCmd('ar'));
}

function kanoBuild({ app, config = {}, out }, commandOpts) {
    const TMP_DIR = path.join(os.tmpdir(), 'kash-kano-build');
    const BUILD_DIR = path.join(TMP_DIR, 'build');
    const APP_DIR = path.join(TMP_DIR, 'app');
    const DEB_DIR = path.join(TMP_DIR, 'deb');
    const APP_RESOURCES_DIR = path.join(DEB_DIR, 'data/usr/share');
    rimraf.sync(TMP_DIR);
    mkdirp.sync(BUILD_DIR);
    mkdirp.sync(APP_DIR);
    mkdirp.sync(DEB_DIR);
    const appName = underscore(config.APP_NAME);
    return checkEnv(commandOpts.skipAr)
        // Bundle app in tmp dir
        .then(() => build({ app, config, out: BUILD_DIR }, commandOpts))
        .then(() => {
            processState.setStep('Creating linux app');
            // Create executable for linux using electron-packager
            const packagerOptions = {
                dir: BUILD_DIR,
                packageManager: 'yarn',
                overwrite: true,
                out: APP_DIR,
                prune: true,
                // TODO: use asar package. This does not work at the moment as it causes an issue with the PIXI loader
                // XHR maybe?
                asar: false,
                name: appName,
                platform: 'linux',
                arch: 'armv7l',
                quiet: true,
            };
            return packager(packagerOptions);
        })
        .then(() => {
            // Move the generated linux app to the debian structure
            mkdirp.sync(APP_RESOURCES_DIR);
            fs.renameSync(
                path.join(APP_DIR, `${appName}-linux-armv7l`),
                path.join(APP_RESOURCES_DIR, kebab(config.APP_NAME)),
            );
            processState.setSuccess('Created linux app');
            processState.setStep('Preparing debian package');
            const targetDir = commandOpts.skipAr ? out : DEB_DIR;
            // Create structure and files for debian package
            const tasks = [
                createControl(targetDir, config),
                copyExtra(app, targetDir, config),
            ];
            return Promise.all(tasks).then(() => targetDir)
        })
        .then((dir) => {
            processState.setSuccess('Debian package ready');
            if (commandOpts.skipAr) {
                return;
            }
            processState.setStep('Creating .deb file');
            // Create .deb file from debian structure
            return createDeb(dir, out, config)
                .then(() => processState.setSuccess('Created .deb file'));
        });
}

module.exports = kanoBuild;
