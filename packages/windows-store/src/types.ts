import { WindowsBuildOptions, WindowsConfig } from '@kano/kit-app-shell-windows/lib/types';

export type WindowsStoreConfig = WindowsConfig & {
    WINDOWS_STORE? : {
        PACKAGE_NAME? : string;
        PUBLISHER_DISPLAY_NAME? : string;
        PUBLISHER? : string;
        PACKAGE_DISPLAY_NAME? : string;
        SMALL_TILE? : string;
        MEDIUM_TILE? : string;
        WIDE_TILE? : string;
        LARGE_TILE? : string;
        APP_ICON? : string;
        SPLASH_SCREEN? : string;
        BADGE_LOGO? : string;
        PACKAGE_LOGO? : string;
        TILE_BACKGROUND? : string;
        SPLASH_SCREEN_BACKGROUND? : string;
    };
    ICONS? : {
        WINDOWS_STORE? : string;
    };
};

export type WindowsStoreBuildOptions = WindowsBuildOptions & {
    devCert? : string;
    windowsKit? : string;
    config : WindowsStoreConfig;
};
