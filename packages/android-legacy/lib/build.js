"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const build_1 = require("@kano/kit-app-shell-cordova/lib/build");
const platform = require("./platform");
module.exports = (opts) => {
    opts.preferences = opts.preferences || {};
    opts.preferences.xwalkMultipleApk = false;
    return build_1.default(Object.assign({}, opts, { cacheId: 'android-legacy', platforms: platform.platforms, plugins: platform.plugins, hooks: platform.hooks, targets: {
            chrome: 53,
        } }));
};
//# sourceMappingURL=build.js.map