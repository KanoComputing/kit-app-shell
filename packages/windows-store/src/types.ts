import { WindowsBuildOptions, WindowsConfig } from '@kano/kit-app-shell-windows/lib/types';

export type WindowsStoreConfig = WindowsConfig & {
    WINDOWS_STORE? : {
        PACKAGE_NAME? : string;
        PUBLISHER_DISPLAY_NAME? : string;
        PUBLISHER? : string;
        PACKAGE_DISPLAY_NAME? : string;
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
