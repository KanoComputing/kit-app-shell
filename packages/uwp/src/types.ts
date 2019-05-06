import { IBuildOptions } from '@kano/kit-app-shell-core/lib/types';

export type IUWPBuildOptions = IBuildOptions & {
    release? : boolean;
    certificates : { [K : string] : string };
    msbuildPath? : string;
};
