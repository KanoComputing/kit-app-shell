import { KashConfig } from '@kano/kit-app-shell-core/lib/types';
import { WindowsBuildOptions } from '@kano/kit-app-shell-windows/lib/types';

export type WindowsStoreConfig = KashConfig & {
    WINDOWS_STORE? : {
        PACKAGE_NAME : string;
        PUBLISHER_DISPLAY_NAME : string;
        PUBLISHER : string;
        PACKAGE_DISPLAY_NAME : string;
    };
    ICONS? : {
        WINDOWS_STORE: string;
    };
};

export type WindowsStoreBuildOptions = WindowsBuildOptions & {
    config : WindowsStoreConfig;
};