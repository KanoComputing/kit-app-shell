declare class Config {
    constructor(cfg : string);
    addHook(type : string, path : string) : void;
    setPreference(key : string, value : any) : void;
    write() : Promise<void>;
}

declare module "cordova-config" {
    export = Config;
}