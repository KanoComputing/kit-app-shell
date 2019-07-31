import { IOptions, Builder, ITestContext } from '@kano/kit-app-shell-core/lib/types';

export interface ISaucelabsOptions {
    user : string;
    key : string;
}

export interface IBitBarOptions {
    key : string;
}

export interface IBrowserstackOptions {
    user : string;
    key : string;
}

export interface IKobitonOptions {
    user : string;
    key : string;
}

export type TestOptions = IOptions & {
    saucelabs? : ISaucelabsOptions;
    bitbar? : IBitBarOptions;
    browserstack? : IBrowserstackOptions;
    kobiton? : IKobitonOptions;
};

export type IProvider = (
    app : string,
    wd : typeof import('wd'),
    ctx : ITestContext,
    opts : TestOptions,
)  => Promise<Builder>;
