import { ICordovaPreferences } from './types';

/**
 * Collect the key in the options and move it under the preferences key
 * @param opts Options provided by the command
 * @param preference Key to set the cordova preference
 * @param key Key in the opts object
 */
export function collectPreference(opts : { preferences : ICordovaPreferences }, preference : string, key : string) {
    if (!opts[key]) {
        return;
    }
    opts.preferences[preference] = opts[key];
    delete opts[key];
}
