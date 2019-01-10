import { ElectronBuildOptions } from '@kano/kit-app-shell-electron/lib/types';
import { KashConfig } from '@kano/kit-app-shell-core/lib/types';

export type MacosBuildOptions = ElectronBuildOptions & {
    config : KashConfig & {
        ICONS : {
            MACOS : string
        };
    };
};
