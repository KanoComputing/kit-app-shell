window.Shell = {
    defined: false,
    define(UIClass) {
        if (this.defined) {
            return;
        }
        this.defined = true;
        this.UIClass = UIClass;
        const app = new window.Shell.UIClass(window.NativeBus, window.KitAppShellConfig);
        if (!(app.root instanceof HTMLElement)) {
            throw new Error('Could not run app: the property \'root\' in your App class is not of type HTMLElement');
        }
        document.body.appendChild(app.root);
    },
};

import(window.KitAppShellConfig.APP_SRC);
