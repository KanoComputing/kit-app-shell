function loadScript(src, mod = false) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.type = mod ? 'module' : 'text/javascript';
        script.onload = resolve;
        script.onerror = reject;
        script.src = src;
        // Want to be blocking
        document.head.appendChild(script);
    });
}

window.Shell = {
    defined: false,
    define(UIClass) {
        if (this.defined) {
            return;
        }
        this.defined = true;
        this.UIClass = UIClass;
        const app = new window.Shell.UIClass(window.NativeBus, window.KitAppShellConfig);

        document.body.appendChild(app.root);
    },
};

const src = `${window.KitAppShellConfig.UI_ROOT}index.js`;

if (window.KitAppShellConfig.MODULE_TYPE === 'system') {
    loadScript(`./js/r.js`)
        .then(() => {
            requirejs([src]);
        });
} else {
    loadScript(src, window.KitAppShellConfig.MODULE_TYPE === 'es');
}
