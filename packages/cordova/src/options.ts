import { BuildOptions, RunOptions } from '@kano/kit-app-shell-core/lib/options';

export type CordovaBuildOptions = BuildOptions & {
    clean? : Array<string>;
    platforms: Array<string>;
    run: boolean;
    buildOpts: {};
};

export type CordovaRunOptions = RunOptions & {
    platforms : Array<string>;
};
