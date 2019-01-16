import { getModulePath } from '@kano/kit-app-shell-cordova/lib/util';
import * as androidPlatform from '@kano/kit-app-shell-android/lib/platform';

const plugins = [
    ...androidPlatform.plugins,
    getModulePath('cordova-plugin-crosswalk-webview'),
];

const hooks = {
    ...androidPlatform.hooks,
    before_prepare: [
        ...androidPlatform.hooks.before_prepare,
    ],
};

const platforms = [
    ...androidPlatform.platforms,
];

export {
    platforms,
    plugins,
    hooks,
};
