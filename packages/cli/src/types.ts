export interface IArgv {
    [key : string] : string;
}

export interface ISywac {
    _addOptionType(flags : string, opts : any, type : string);
    positional(flags : string, opts : any);
    string(flags : string, opts : any);
    style(opts : any);
    array(flags : any, opts? : any);
    check(flags : any, opts? : any);
}
