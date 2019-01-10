import { CordovaBuildOptions, CordovaPreferences } from '@kano/kit-app-shell-cordova/lib/types';

export type AndroidLegacyBuildPreferences = CordovaPreferences & {
    xwalkMultipleApk : boolean;
};

export type AndroidLegacyBuildOptions = CordovaBuildOptions & {
    preferences? : AndroidLegacyBuildPreferences;
};
