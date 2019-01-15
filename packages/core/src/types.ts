import { IReplaceOptions } from './plugins/replace';

export interface IBundleHtmlOptions {
    replacements? : {
        [propName : string] : string;
    };
}

export interface IBundleOptions {
    html : IBundleHtmlOptions;
    js : IBundleSourceOptions;
    appJs : BundleAppOptions;
}

export type BundleAppOptions = IBundleSourceOptions & {
    resources? : string[];
};

export interface IBundledFile {
    fileName : string;
    code : string;
}

export interface IBundle {
    html : IBundledFile;
    js : IBundledFile[];
    appJs : IBundledFile[];
    appStatic : {
        root : string;
        files : string[];
    };
}

export interface ICopyTask {
    root : string;
    files : string[];
}

export interface IBundleSourceOptions {
    polyfills? : string[];
    moduleContext? : {
        [key : string] : string;
    };
    replaces? : IReplaceOptions[];
    targets? : {};
    babelExclude? : string[];
    bundleOnly? : boolean;
    appSrcName? : string;
}

export interface IKashConfig {
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
}

export interface IOptions {
    app : string;
    config : IKashConfig;
    out : string;
    tmpdir? : string;
    [propName : string] : any;
}

export interface IBuildOptions extends IOptions, IBundleSourceOptions {}

export interface IRunOptions {
    app : string;
    config : IKashConfig;
    tmpdir? : string;
    [propName : string] : any;
}

export declare type TestOptions = IOptions & {
    spec? : string[];
};

export interface IDisposable {
    dispose();
}

export type Builder = (test : Mocha.Test) => Promise<import('wd').WebDriver>;

export type IBuilderFactory = (wd : typeof import('wd'), mocha : import('mocha'), opts : any) => Promise<Builder>;

export type IBuild = (opts : IBuildOptions)  => Promise<string>;

export type IRun = (opts : IRunOptions)  => Promise<any>;

interface IAnswers {
    [propName : string] : any;
}

export interface IConfigure {
    // TODO: enquirer types
    enquire?(prompt : any, cfg : any) : IAnswers;
    generate?(answers : IAnswers) : any;
}

export type ISywacConfigure = (sywac : typeof import('sywac'))  => void;

export interface ICli {
    group? : string;
    commands? : ISywacConfigure;
    run? : ISywacConfigure;
    build? : ISywacConfigure;
    test? : ISywacConfigure;
    sign? : ISywacConfigure;
}
