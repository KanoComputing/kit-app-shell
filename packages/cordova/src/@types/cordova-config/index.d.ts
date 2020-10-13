// @ts-ignore
declare class Config {
    constructor(cfg : string);
    addHook(type : string, path : string) : void;
    setPreference(key : string, value : any) : void;
    write() : Promise<void>;
    addRawXML: any;
}

declare module "cordova-config" {
    // @ts-ignore
    export = Config;
}