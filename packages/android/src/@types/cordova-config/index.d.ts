declare class Config {
    constructor(cfg : string);
    addHook(type : string, path : string) : void;
    setPreference(key : string, value : any) : void;
    write() : Promise<void>;
    setDescription(desc : string) : void;
    setVersion(desc : string) : void;
    setAndroidVersionCode(desc : string) : void;
    setElement(tag : string, content : string, attrs : {}) : void;
}

declare module "cordova-config" {
    export = Config;
}