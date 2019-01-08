"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const platform_1 = require("@kano/kit-app-shell-core/lib/util/platform");
module.exports = (wd, mocha, opts) => {
    if (opts.provider !== 'local') {
        return platform_1.loadPlatformKey('test', 'get-builder')
            .then((getBuilder) => {
            return getBuilder(wd, mocha, opts);
        });
    }
    return null;
};
//# sourceMappingURL=get-builder.js.map