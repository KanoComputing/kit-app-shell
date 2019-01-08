"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function collectPreference(opts, preference, key) {
    if (!opts[key]) {
        return;
    }
    opts.preferences[preference] = opts[key];
    delete opts[key];
}
exports.collectPreference = collectPreference;
//# sourceMappingURL=preferences.js.map