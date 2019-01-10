import { Options, Builder } from '@kano/kit-app-shell-core/lib/types';

export interface SaucelabsOptions {
    user: string;
    key : string;
}

export interface BitBarOptions {
    key : string;
}

export interface BrowserstackOptions {
    user : string;
    key : string;
};

export interface KobitonOptions {
    user : string;
    key : string;
}

export type TestOptions = Options & {
    saucelabs? : SaucelabsOptions;
    bitbar? : BitBarOptions;
    browserstack? : BrowserstackOptions;
    kobiton? : KobitonOptions;
}

export interface IProvider {
    (app : string, wd : typeof import('wd'), mocha : import('mocha'), opts : TestOptions) : Promise<Builder>;
}
