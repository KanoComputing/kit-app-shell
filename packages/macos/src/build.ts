import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import build from '@kano/kit-app-shell-electron/lib/build';
import * as path from 'path';
import * as os from 'os';
import * as packager from 'electron-packager';
import { promisify } from 'util';
import * as mkdirpCb from 'mkdirp';
import * as rimrafCb from 'rimraf'
import { MacosBuildOptions } from './options';
import { IBuild } from '@kano/kit-app-shell-core/lib/types';

const mkdirp = promisify(mkdirpCb);
const rimraf = promisify(rimrafCb);

const defaultIconPath = path.join(__dirname, '../icons/1024.png.icns');

const macosBuild : IBuild =  function (opts : MacosBuildOptions) {
    const {
        app,
        config,
        out,
        bundleOnly,
        tmpdir = os.tmpdir(),
    } = opts;
    const warnings = [];
    const TMP_DIR = path.join(tmpdir, 'kash-macos-build');
    const icon = config.ICONS && config.ICONS.MACOS ?
        path.join(app, config.ICONS.MACOS) : defaultIconPath;
    let name = config.APP_NAME;
    if (!config.APP_NAME) {
        warnings.push('\'APP_NAME\' missing in config, will use \'App\' as name');
        name = 'App';
    }
    return rimraf(TMP_DIR)
        .then(() => mkdirp(TMP_DIR))
        .then(() => build({
            app,
            config,
            out: TMP_DIR,
            bundleOnly,
        }))
        .then((buildDir) => {
            processState.setInfo('Creating macOS app');
            const packagerOptions = {
                dir: buildDir,
                packageManager: 'yarn',
                overwrite: true,
                out,
                prune: true,
                // TODO: use asar package.
                // This does not work at the moment as it causes an issue with the PIXI loader
                // XHR maybe?
                asar: false,
                name,
                platform: 'darwin',
                arch: 'x64',
                icon,
                quiet: false,
                mac: true,
            };
            return packager(packagerOptions);
        })
        .then(() => {
            warnings.forEach(w => processState.setWarning(w));
            processState.setSuccess('Created macOS app');
            return out;
        });
}

export default macosBuild;
