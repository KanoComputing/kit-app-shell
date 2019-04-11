export const customProvider = (wd, mocha, opts) => {
    if (!opts.providers) {
        return Promise.resolve(null);
    }
    const c = opts.providers.find((p) => p.id === opts.provider);
    if (!c || !c.getBuilder) {
        return Promise.resolve(null);
    }
    return c.getBuilder(wd, mocha, opts);
};

export default customProvider;
