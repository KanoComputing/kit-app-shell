import { ElectronBuildOptions } from '@kano/kit-app-shell-electron/lib/types';
import { IKashConfig } from '@kano/kit-app-shell-core/lib/types';

export type WindowsConfig = IKashConfig & {
    ICONS? : {
        WINDOWS? : string;
    };
    MANUFACTURER? : string;
};

export type WindowsBuildOptions = ElectronBuildOptions & {
    skipInstaller? : boolean;
    config : WindowsConfig;
};
