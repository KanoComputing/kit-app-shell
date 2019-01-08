"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const run_1 = require("@kano/kit-app-shell-cordova/lib/run");
const platform = require("./platform");
exports.default = opts => run_1.default(Object.assign({}, opts, { platforms: platform.platforms, plugins: platform.plugins, hooks: platform.hooks, cacheId: 'android' }));
//# sourceMappingURL=run.js.map