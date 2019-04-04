declare module 'wd' {

    type AsserterCallback = (err : Error|null, ...args : any[]) => void;
    type AsserterOptions = (target : any, cb : AsserterCallback) => void;

    class Context {}

    class WebDriver {
        contexts() : Promise<Context[]>;
        context(ctx : Context) : Promise<any>;
        waitFor<T>(asserter : Asserter<T>) : Promise<T>;
        resetApp() : Promise<void>;
        quit() : Promise<void>;
        takeScreenshot() : Promise<any>;
    }
    class Asserter<T> {
        constructor(asserter : AsserterOptions);
    }
}