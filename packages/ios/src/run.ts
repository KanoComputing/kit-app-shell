import run from '@kano/kit-app-shell-cordova/lib/run';
import * as platform from './platform';

export default opts => run({
    ...opts,
    platforms: platform.platforms,
    plugins: platform.plugins,
    hooks: platform.hooks,
    cacheId: 'ios',
});
