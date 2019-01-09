import { ElectronBuildOptions } from '@kano/kit-app-shell-electron/lib/options';
import { KashConfig } from '@kano/kit-app-shell-core/lib/options';

export type MacosBuildOptions = ElectronBuildOptions & {
    config : KashConfig & {
        ICONS : {
            MACOS : string
        };
    };
};
