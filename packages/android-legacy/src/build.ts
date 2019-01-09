import build from '@kano/kit-app-shell-cordova/lib/build';
import * as platform from './platform';

module.exports = (opts) => {
    // Force a false on this preference
    // TODO: More advanced configuration of preferences
    opts.preferences = opts.preferences || {};
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
