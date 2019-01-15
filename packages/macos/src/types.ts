import { ElectronBuildOptions } from '@kano/kit-app-shell-electron/lib/types';
import { IKashConfig } from '@kano/kit-app-shell-core/lib/types';

export type MacosBuildOptions = ElectronBuildOptions & {
    config : IKashConfig & {
        ICONS : {
            MACOS : string,
        };
    };
};
