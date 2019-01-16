import { IBuildOptions } from '@kano/kit-app-shell-core/lib/types';

export type ElectronBuildOptions = IBuildOptions & {
    bundle? : {
        patterns? : string[];
        forcePlatform? : string;
        ignore? : string[];
    },
};
