import * as path from 'path';
import { getModulePath } from '@kano/kit-app-shell-cordova/lib/util';

// Load plugins and platforms from the local dependencies.
// This avoid using cordova-fetch and having to download deps on every build
const platforms = [getModulePath('cordova-ios')];
const plugins = [
    getModulePath('cordova-plugin-add-swift-support'),
    getModulePath('cordova-plugin-blob-constructor-polyfill'),
    getModulePath('cordova-plugin-ios-ble-permissions'),
    getModulePath('cordova-plugin-protocol'),
    path.join(__dirname, '../plugin'),
];

const hooks = {
    before_prepare: [
        require.resolve('./hooks/config'),
        require.resolve('./hooks/generate-icons'),
    ],
};

export {
    platforms,
    plugins,
    hooks,
};
