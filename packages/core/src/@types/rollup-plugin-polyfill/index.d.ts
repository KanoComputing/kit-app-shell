declare module 'rollup-plugin-polyfill' {
    function polyfill(filter : string, polyfills : string[]) : any;
    export = polyfill;
}
