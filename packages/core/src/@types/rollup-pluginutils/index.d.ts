declare module 'rollup-pluginutils' {
    type ReturnValue = (id: string | any) => boolean;

    function createFilter (
        include?: Array<string | RegExp> | string | RegExp | null,
        exclude?: Array<string | RegExp> | string | RegExp | null
    ) : ReturnValue;
}
