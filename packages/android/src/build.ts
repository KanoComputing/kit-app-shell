import build from '@kano/kit-app-shell-cordova/lib/build';
import { collectPreference } from '@kano/kit-app-shell-cordova/lib/preferences';
import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import * as platform from './platform';
import { promisify } from 'util';
import * as globCb from 'glob';
import * as mkdirpCb from 'mkdirp'
import * as path from 'path';
import * as fs from 'fs';
import { CordovaBuildOptions, CordovaPreferences } from '@kano/kit-app-shell-cordova/lib/types';
import { IBuild } from '@kano/kit-app-shell-core/lib/types';

const mkdirp = promisify(mkdirpCb);
const glob = promisify(globCb);

const rename = promisify(fs.rename);

const DEFAULT_PREFERENCES = {
    'android-targetSdkVersion': 28,
};

function collectPreferences(opts : { preferences : CordovaPreferences }) : void {
    opts.preferences = opts.preferences || {} as CordovaPreferences;
    collectPreference(opts, 'android-minSdkVersion', 'minSdkVersion');
    collectPreference(opts, 'android-maxSdkVersion', 'maxSdkVersion');
    collectPreference(opts, 'android-targetSdkVersion', 'targetSdkVersion');
    opts.preferences = Object.assign({}, DEFAULT_PREFERENCES, opts.preferences);
}

const androidBuild : IBuild = (opts : CordovaBuildOptions) => {
    collectPreferences(opts);
    return build({
        ...opts,
        cacheId: 'android',
        platforms: platform.platforms,
        plugins: platform.plugins,
        hooks: platform.hooks,
        targets: {
            chrome: 53,
        },
        clean: ['platforms/android/app/build/outputs/apk'],
    })
        .then((projectPath) => {
            // Find the generated apk
            const dest = path.join(projectPath, 'platforms/android/app/build/outputs/apk');
            return glob('**/*.apk', { cwd: dest })
                .then((results) => {
                    const [result] = results;
                    if (!result) {
                        throw new Error('Could not find generated .apk file');
                    }
                    // Move the generated apk to the out directory
                    const target : string = path.join(opts.out, path.basename(result));
                    // Ensure the directory exists
                    return mkdirp(opts.out)
                        .then(() => rename(path.join(dest, result), target))
                        .then(() => processState.setSuccess(`Built android app at ${target}`))
                        .then(() => target);
                });
        });
};

export default androidBuild;
