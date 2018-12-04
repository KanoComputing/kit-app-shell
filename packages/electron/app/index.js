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

import(window.KitAppShellConfig.APP_SRC);
