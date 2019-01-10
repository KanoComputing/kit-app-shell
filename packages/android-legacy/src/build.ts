import build from '@kano/kit-app-shell-cordova/lib/build';
import * as platform from './platform';
import { IBuild } from '@kano/kit-app-shell-core/lib/types';
import { AndroidLegacyBuildPreferences, AndroidLegacyBuildOptions } from './types';

const androidLegacyBuild : IBuild = (opts : AndroidLegacyBuildOptions) => {
    // Force a false on this preference
    // TODO: More advanced configuration of preferences
    opts.preferences = opts.preferences || {} as AndroidLegacyBuildPreferences;
    opts.preferences.xwalkMultipleApk = false;
    return build({
        ...opts,
        cacheId: 'android-legacy',
        platforms: platform.platforms,
        plugins: platform.plugins,
        hooks: platform.hooks,
        targets: {
            chrome: 53,
        },
    });
};

export default androidLegacyBuild;
