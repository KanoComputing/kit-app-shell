import { ReplaceOptions } from './plugins/replace';

export interface BundleHtmlOptions {
    replacements? : {
        [propName : string] : string;
    };
};

export interface BundleOptions {
    html : BundleHtmlOptions;
    js : BundleSourceOptions;
    appJs : BundleAppOptions;
};

export type BundleAppOptions = BundleSourceOptions & {
    resources? : Array<string>;
};

export interface BundledFile {
    fileName: string;
    code: string;
};

export interface Bundle {
    html : BundledFile;
    js : Array<BundledFile>;
    appJs : Array<BundledFile>;
    appStatic : {
        root : string;
        files : Array<string>;
    };
};

export interface CopyTask {
    root: string;
    files: Array<string>;
};

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
};

export interface KashConfig {
    APP_NAME : string;
    APP_ID : string;
    APP_DESCRIPTION? : string;
    VERSION? : string;
    UI_VERSION? : string;
    ENV? : string;
    UI_ROOT? : string;
    APP_SRC? : string;
    BUILD_NUMBER? : string;
    BACKGROUND_COLOR? : string;
};

export type Options = {
    app : string;
    config : KashConfig;
    out : string;
    tmpdir? : string;
    [propName : string] : any;
};

export type BuildOptions = Options & BundleSourceOptions;

export type RunOptions = {
    app : string;
    config : KashConfig;
    tmpdir? : string;
    [propName : string] : any;
};

export declare type TestOptions = Options & {
    spec? : Array<string>;
};

export interface IDisposable {
    dispose();
};

export type Builder = (test : Mocha.Test) => Promise<import('wd').WebDriver>;

export type IBuilderFactory = (wd: typeof import('wd'), mocha: import('mocha'), opts: any) => Promise<Builder>;

export interface IBuild {
    (opts : BuildOptions) : Promise<string>;
};

export interface IRun {
    (opts : RunOptions) : Promise<any>;
};

interface Answers {
    [propName : string] : any;
};

export interface IConfigure {
    // TODO: enquirer types
    enquire? (prompt : any, cfg : any) : Answers;
    generate? (answers : Answers) : any;
};

export interface ISywacConfigure {
    (sywac : typeof import('sywac')) : void;
};

export interface ICli {
    group? : string;
    commands? : ISywacConfigure;
    run? : ISywacConfigure;
    build? : ISywacConfigure;
    test? : ISywacConfigure;
    sign? : ISywacConfigure;
};
