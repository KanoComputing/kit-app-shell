export interface Argv {
    [key : string] : string;
};

export type Sywac = {
    _addOptionType(flags : string, opts : any, type : string);
    positional(flags : string, opts : any);
    style(opts : any);
};
