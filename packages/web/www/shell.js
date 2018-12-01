class FakeBus {
    on() {}
    removeListener() {}
    emit() {}
}

window.NativeBus = new FakeBus();

function getJSON(url) {
    return fetch(url)
        .then(r => r.json());
}

function loadConfig() {
    return getJSON('/_config')
        .then((config) => {
            config.OS_PLATFORM = 'web';
            config.OS_VERSION = navigator.userAgent;

            const testConfig = localStorage.getItem('testConfig');
            if (testConfig) {
                Object.assign(config, JSON.parse(testConfig) || {});
            }

            return config;
        });
}

let p = Promise.resolve(window.KitAppShellConfig);

if (!window.KitAppShellConfig) {
    p = loadConfig();
}

p
    .then((config) => {
        window.Shell = {
            defined: false,
            define(UIClass) {
                if (this.defined) {
                    return;
                }
                this.defined = true;
                this.UIClass = UIClass;
                const app = new window.Shell.UIClass(window.NativeBus, config);
                document.body.appendChild(app.root);
            },
        };
        import(window.KitAppShellConfig.APP_SRC || config.APP_SRC);
    });

