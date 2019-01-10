import run from '@kano/kit-app-shell-cordova/lib/run';
import * as platform from './platform';
import { CordovaRunOptions } from '@kano/kit-app-shell-cordova/lib/types';
import { IRun } from '@kano/kit-app-shell-core/lib/types';

const androidRun : IRun = (opts : CordovaRunOptions) => run({
    ...opts,
    platforms: platform.platforms,
    plugins: platform.plugins,
    hooks: platform.hooks,
    cacheId: 'android',
});

export default androidRun;
