/**
 * Collect the key in the options and move it under the preferences key
 * @param {Object} opts Options provided by the command
 * @param {String} preference Key to set the cordova preference
 * @param {String} key Key in the opts object
 */
export function collectPreference(opts, preference, key) {
    if (!opts[key]) {
        return;
    }
    opts.preferences[preference] = opts[key];
    delete opts[key];
}
