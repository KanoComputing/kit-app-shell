import { IReplaceOptions } from './plugins/replace';
import { ICheck } from './check';
import * as rollup from 'rollup';
import { IResources } from './util/resource';

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
    skipMinifyHtml?: boolean;
    skipBabel?: boolean;
    skipTerser?: boolean;
    appSrcName? : string;
    outputFormat? : rollup.OutputOptions;
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
    [propName : string] : any;
}

export interface IConfigOverrides {
    [propName : string] : any;
}

export interface IOptions {
    app : string;
    config : IKashConfig;
    out : string;
    tmpdir? : string;
    additionalResources? : IResources;
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

export interface ISignOptions {
    app : string;
}

export interface IDisposable {
    dispose() : void;
}

export type WD = any;
export type WebDriver = any;
export type Sywac = any;

export type Builder = () => Promise<WebDriver>;

export interface ITestContext {
    beforeEach : (cb : () => any) => void;
    beforeAll : (cb : () => any) => void;
    afterEach : (cb : () => any) => void;
    afterAll : (cb : () => any) => void;
}

export type IBuilderFactory = (wd : WD, ctx : ITestContext, opts : any) => Promise<Builder>;

export type IBuild = (opts : IBuildOptions)  => Promise<string>;

export type IRun = (opts : IRunOptions)  => Promise<any>;

export type ISign = (opts : ISignOptions)  => Promise<any>;

interface IAnswers {
    [propName : string] : any;
}

export interface IConfigure {
    // TODO: enquirer types
    enquire?(prompt : any, cfg : any) : IAnswers;
    generate?(answers : IAnswers) : any;
}

export interface IDoctor {
    checks? : ICheck[];
}

export type ISywacConfigure = (sywac : Sywac)  => void;

export enum ICommand {
    Run = 'run',
    Build = 'build',
    Test = 'test',
    Sign = 'sign',
    Configure = 'configure',
    Doctor = 'doctor',
}

type ICliCommand = {
    [key in ICommand]? : ISywacConfigure;
};

export type ICli = ICliCommand & {
    group? : string;
    commands? : ISywacConfigure;
};
