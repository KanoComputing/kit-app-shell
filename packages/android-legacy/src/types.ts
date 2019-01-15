import { ICordovaBuildOptions, ICordovaPreferences } from '@kano/kit-app-shell-cordova/lib/types';

export type AndroidLegacyBuildPreferences = ICordovaPreferences & {
    xwalkMultipleApk : boolean;
};

export type AndroidLegacyBuildOptions = ICordovaBuildOptions & {
    preferences? : AndroidLegacyBuildPreferences;
};
