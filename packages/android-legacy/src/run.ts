import run from '@kano/kit-app-shell-cordova/lib/run';
import * as platform from './platform';
import { IRun } from '@kano/kit-app-shell-core/lib/types';
import { CordovaRunOptions } from '@kano/kit-app-shell-cordova/lib/types';

const androidLegacyRun : IRun = (opts : CordovaRunOptions) => run({
    ...opts,
    platforms: platform.platforms,
    plugins: platform.plugins,
    hooks: platform.hooks,
    cacheId: 'android-legacy',
});

export default androidLegacyRun;
