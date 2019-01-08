import { getModulePath } from '@kano/kit-app-shell-cordova/lib/util';

// Load plugins and platforms from the local dependencies.
// This avoid using cordova-fetch and having to download deps on every build
const platforms = [getModulePath('cordova-android')];
const plugins = [
    getModulePath('cordova-plugin-ionic-webview'),
];

const hooks = {
    before_prepare: [
        require.resolve('./hooks/generate-icons'),
        require.resolve('./hooks/config'),
    ],
    after_prepare: [
        require.resolve('./hooks/repo-hack'),
        require.resolve('./hooks/update-version'),
    ],
};

export {
    platforms,
    plugins,
    hooks,
};
