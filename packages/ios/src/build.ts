import build from '@kano/kit-app-shell-cordova/lib/build';
import { collectPreference } from '@kano/kit-app-shell-cordova/lib/preferences';
import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import * as platform from './platform';
import * as globCb from 'glob';
import * as mkdirpCb from 'mkdirp';
import { IBuild } from '@kano/kit-app-shell-core/lib/types';

const glob = promisify(globCb);
const mkdirp = promisify(mkdirpCb);
const rename = promisify(fs.rename);

const DEFAULT_PREFERENCES = {
    Scheme: 'kit-app',
    DisallowOverscroll: true,
};

function collectPreferences(opts) {
    opts.preferences = opts.preferences || {};
    collectPreference(opts, 'target-device', 'targetDevice');
    collectPreference(opts, 'deployment-target', 'deploymentTarget');
    collectPreference(opts, 'Scheme', 'scheme');
    opts.preferences = Object.assign({}, DEFAULT_PREFERENCES, opts.preferences);
}

const iosBuild : IBuild = (opts) => {
    collectPreferences(opts);
    return build({
        ...opts,
        cacheId: 'ios',
        platforms: platform.platforms,
        plugins: platform.plugins,
        hooks: platform.hooks,
        targets: {
            safari: 10,
        },
        buildOpts: {
            options: {
                device: true,
            },
        },
    })
        .then((projectPath) => {
            const dest = path.join(projectPath, 'platforms/ios/build/device');
            return glob('*.ipa', { cwd: dest })
                .then((results) => {
                    const [result] = results;
                    if (!result) {
                        throw new Error('Could not find generated .ipa file');
                    }
                    const target = path.join(opts.out, result);
                    return mkdirp(opts.out)
                        .then(() => rename(path.join(dest, result), target))
                        .then(() => processState.setSuccess(`Built iOS app at ${target}`))
                        .then(() => target);
                });
        });
};

export default iosBuild;
