import run from '@kano/kit-app-shell-cordova/lib/run';
import * as platform from './platform';
import { CordovaRunOptions } from '@kano/kit-app-shell-cordova/lib/types';
import { IRun } from '@kano/kit-app-shell-core/lib/types';
import { collectPreferences } from '@kano/kit-app-shell-cordova/lib/preferences';
import { PREFERENCE_MAPPING, DEFAULT_PREFERENCES } from './preferences';

const androidRun : IRun = (opts : CordovaRunOptions) => {
    collectPreferences(opts, PREFERENCE_MAPPING, DEFAULT_PREFERENCES);
    return run({
        ...opts,
        platforms: platform.platforms,
        plugins: platform.plugins,
        hooks: platform.hooks,
        cacheId: 'android',
    });
};

export default androidRun;
