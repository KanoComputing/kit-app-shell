import run from '@kano/kit-app-shell-cordova/lib/run';
import * as platform from './platform';
import { IRun } from '@kano/kit-app-shell-core/lib/types';
import { CordovaRunOptions } from '@kano/kit-app-shell-cordova/lib/types';

import { collectPreferences } from '@kano/kit-app-shell-cordova/lib/preferences';
import { PREFERENCE_MAPPING, DEFAULT_PREFERENCES } from './preferences';

const iosRun : IRun = (opts : CordovaRunOptions) => {
    collectPreferences(opts, PREFERENCE_MAPPING, DEFAULT_PREFERENCES);
    return run({
        ...opts,
        platforms: platform.platforms,
        plugins: platform.plugins,
        hooks: platform.hooks,
        cacheId: 'ios',
    });
};

export default iosRun;
