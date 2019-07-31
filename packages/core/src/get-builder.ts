export const customProvider = (wd, ctx, opts) => {
    if (!opts.providers) {
        return Promise.resolve(null);
    }
    const c = opts.providers.find((p) => p.id === opts.provider);
    if (!c || !c.getBuilder) {
        return Promise.resolve(null);
    }
    return c.getBuilder(wd, ctx, opts);
};

export default customProvider;
