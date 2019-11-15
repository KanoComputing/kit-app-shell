import build from '@kano/kit-app-shell-cordova/lib/build';
import { collectPreferences } from '@kano/kit-app-shell-cordova/lib/preferences';
import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import * as platform from './platform';
import * as globCb from 'glob';
import * as mkdirpCb from 'mkdirp';
import { IBuild } from '@kano/kit-app-shell-core/lib/types';
import { PREFERENCE_MAPPING, DEFAULT_PREFERENCES } from './preferences';
import { ICordovaBuildOptions } from '@kano/kit-app-shell-cordova/lib/types';
import { openXcodeProject } from './open-xcode';
const webView = require('cordova-plugin-ionic-webview/package.json');

const glob = promisify(globCb);
const mkdirp = promisify(mkdirpCb);
const rename = promisify(fs.rename);

const iosBuild : IBuild = (opts : ICordovaBuildOptions) => {
    collectPreferences(opts, PREFERENCE_MAPPING, DEFAULT_PREFERENCES);
    opts.config.UI_ROOT = webView.version === '2.5.3' ? 'http://localhost:8080/www/' : 'ionic://localhost/www/';
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
        skipCordovaBuild: opts.skipXcodebuild,
    })
        .then((projectPath) => {
            if (opts.skipXcodebuild) {
                if (opts.openXcode) {
                    openXcodeProject(projectPath, opts.config.APP_NAME);
                }
                return projectPath;
            }
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
