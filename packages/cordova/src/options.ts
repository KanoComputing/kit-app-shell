import { BuildOptions } from '@kano/kit-app-shell-core/lib/options';

export type CordovaBuildOptions = BuildOptions & {
    clean? : Array<string>;
    platforms: Array<string>;
    run: boolean;
    buildOpts: {};
};
