declare module 'rollup-plugin-virtual' {
    function virtual(map : { [k : string] : string }) : any;
    export = virtual;
}