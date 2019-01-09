import { ElectronBuildOptions } from '@kano/kit-app-shell-electron/lib/options';
import { KashConfig } from '@kano/kit-app-shell-core/lib/options';

export type WindowsBuildOptions = ElectronBuildOptions & {
    skipInstaller? : boolean;
    config: KashConfig & {
        ICONS: {
            WINDOWS : string;
        };
        MANUFACTURER : string;
    };
};