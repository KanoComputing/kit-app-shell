window.Shell = {
    defined: false,
    define(UIClass) {
        if (this.defined) {
            return;
        }
        this.defined = true;
        this.UIClass = UIClass;
        const context = new window.KashAPIs.Context(window.NativeBus, window.KitAppShellConfig);
        const app = new window.Shell.UIClass(context);
        if (!(app.root instanceof HTMLElement)) {
            throw new Error('Could not run app: the property \'root\' in your App class is not of type HTMLElement');
        }
        document.body.appendChild(app.root);
    },
};

function boot() {
    import(window.KitAppShellConfig.APP_SRC);
    return window.KitAppShellConfig;
}

// This will be set if the app is started with the intention to be controlled externally.
// This allows the automation to set localStorage and inject scripts and deciding when the app boots
if (window.__kash_automated__) {
    window.__kash_boot__ = boot;
} else {
    boot();
}