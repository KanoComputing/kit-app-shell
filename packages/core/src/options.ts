import { ReplaceOptions } from './plugins/replace';

export interface BundleOptions {
    html : {};
    js : BundleSourceOptions;
    appJs : BundleAppOptions;
}

export type BundleAppOptions = BundleSourceOptions & {
    resources? : Array<string>;
};

export interface BundledFile {
    fileName: string;
    code: string;
}

export interface Bundle {
    html : BundledFile;
    js : Array<BundledFile>;
    appJs : Array<BundledFile>;
    appStatic: {};
}

export interface CopyTask {
    root: string;
    files: Array<string>;
}

export interface BundleSourceOptions {
    polyfills? : Array<string>;
    moduleContext? : {
        [key : string] : string;
    };
    replaces? : Array<ReplaceOptions>;
    targets? : {};
    babelExclude? : Array<string>;
    bundleOnly? : boolean;
    appSrcName? : string;
}

export interface KashConfig {
    APP_NAME : string;
    APP_ID : string;
}

export type BuildOptions = BundleSourceOptions & {
    app : string;
    config : KashConfig;
    out : string;
    tmpdir? : string;
}
