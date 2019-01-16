declare module 'rollup-plugin-inject' {
    interface RollupPluginInjectOptions {
        modules? : {
            [k : string] : string;
        }
    }
    function inject(options : RollupPluginInjectOptions) : any;
    export = inject;
}