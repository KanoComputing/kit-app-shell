import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import { getBuildPath } from '@kano/kit-app-shell-core/lib/tmp';
import build from '@kano/kit-app-shell-electron/lib/build';
import * as path from 'path';
import * as fs from 'fs';
import * as packager from 'electron-packager';
import { promisify } from 'util';
import * as mkdirpCb from 'mkdirp';
import * as rimrafCb from 'rimraf';
import { MacosBuildOptions } from './types';
import { IBuild } from '@kano/kit-app-shell-core/lib/types';

const mkdirp = promisify(mkdirpCb);
const rimraf = promisify(rimrafCb);
const rename = promisify(fs.rename);

const defaultIconPath = path.join(__dirname, '../icons/1024.png.icns');

const macosBuild : IBuild = (opts : MacosBuildOptions) => {
    const {
        app,
        config = {} as any,
        out,
        bundleOnly,
    } = opts;
    const warnings : string[] = [];
    const TMP_DIR = path.join(getBuildPath(), 'macos');
    const BUILD_DIR = path.join(TMP_DIR, 'build');
    const APP_DIR = path.join(TMP_DIR, 'app');
    const icon = config.ICONS && config.ICONS.MACOS ?
        path.join(app, config.ICONS.MACOS) : defaultIconPath;
    let name = config.APP_NAME;
    if (!config.APP_NAME) {
        warnings.push('\'APP_NAME\' missing in config, will use \'App\' as name');
        name = 'App';
    }
    return rimraf(TMP_DIR)
        .then(() => mkdirp(BUILD_DIR))
        .then(() => mkdirp(APP_DIR))
        .then(() => build({
            ...opts,
            app,
            config,
            out: BUILD_DIR,
            bundleOnly,
            disableV8Snapshot: true,
            // Settings working for v8 snapshot
            // Use them if figure out how to solve the __dirname issue
            // bundle: {
            //     // Ship noble-mac binaries
            //     patterns: [
            //         'node_modules/noble-mac/**/*',
            //         'node_modules/bindings/**/*',
            //         'node_modules/xpc-connection/**/*',
            //         'node_modules/noble/**/*',
            //         'node_modules/bplist-parser/**/*',
            //     ],
            //     forcePlatform: 'darwin',
            //     ignore: [
            //         'noble-mac',
            //         'noble',
            //     ],
            // },
        }))
        .then((buildDir) => {
            processState.setInfo('Creating macOS app');
            const packagerOptions = {
                dir: buildDir,
                packageManager: 'yarn',
                overwrite: true,
                out: APP_DIR,
                prune: false,
                name,
                platform: 'darwin',
                arch: 'x64',
                icon,
                quiet: false,
                mac: true,
            };
            return packager(packagerOptions);
        })
        .then((pkgDirs) => {
            const [pkgDir] = pkgDirs;
            // return pkgDir;
            // Code to copy the v8 snapshot files into the app dir
            // Use when v8 snapshot issue is solved
            const appDir = path.resolve(pkgDir, `${name}.app`);
            const resourcesDir = path.join(appDir, 'Contents/Resources/app');
            // const targetDir = path.join(appDir, 'Contents/Frameworks/Electron Framework.framework/Resources');
            // const SNAPSHOT_BLOB = 'snapshot_blob.bin';
            // const V8_CONTEXT_SNAPSHOT = 'v8_context_snapshot.bin';
            // // Move the snapshot files to the root of the generated app
            // return rename(path.join(resourcesDir, SNAPSHOT_BLOB), path.join(targetDir, SNAPSHOT_BLOB))
            //     .then(() => rename(
            //         path.join(resourcesDir, V8_CONTEXT_SNAPSHOT),
            //         path.join(targetDir,  V8_CONTEXT_SNAPSHOT),
            //     ))
            // Delete the electron directory, it was needed during packaging, but must not be shipped
            return rimraf(path.join(resourcesDir, 'node_modules/electron')).then(() => pkgDir);
        })
        .then((pkgDir) => {
            warnings.forEach((w) => processState.setWarning(w));
            const appName = `${name}.app`;
            const appDir = path.resolve(pkgDir, appName);
            const dest = path.join(out, appName);
            return mkdirp(out)
                .then(() => rimraf(dest))
                .then(() => rename(appDir, dest))
                .then(() => {
                    processState.setSuccess(`Created macOS app at '${dest}'`);
                });
        });
};

export default macosBuild;
