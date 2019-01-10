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
    appStatic : {
        root : string;
        files : Array<string>;
    };
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
    VERSION : string;
    UI_VERSION : string;
    ENV : string;
    UI_ROOT : string;
    APP_SRC : string;
    BUILD_NUMBER : string;
}

export type Options = {
    app : string;
    config : KashConfig;
    out : string;
    tmpdir? : string;
}

export type BuildOptions = Options & BundleSourceOptions;

export type RunOptions = {
    app : string;
    config : KashConfig;
    tmpdir? : string;
};

export interface IDisposable {
    dispose();
}