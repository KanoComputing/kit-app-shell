import { ElectronBuildOptions } from '@kano/kit-app-shell-electron/lib/types';
import { KashConfig } from '@kano/kit-app-shell-core/lib/types';

export type WindowsConfig = KashConfig & {
    ICONS? : {
        WINDOWS? : string;
    };
    MANUFACTURER? : string;
};

export type WindowsBuildOptions = ElectronBuildOptions & {
    skipInstaller? : boolean;
    config : WindowsConfig;
};
