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

export function collectPreferences(
    opts : { preferences : ICordovaPreferences },
    mapping : { [from : string] : any },
    defaults : ICordovaPreferences,
) {
    opts.preferences = opts.preferences || {} as ICordovaPreferences;

    Object.keys(mapping).forEach((from) => collectPreference(opts, mapping[from], from));
    opts.preferences = Object.assign({}, defaults, opts.preferences);
}
