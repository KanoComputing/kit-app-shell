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

const DEFAULT_BACKGROUND_COLOR = '#ffffff';

p
    .then((config) => {
        Object.assign(config, {
            OS_PLATFORM: 'web',
            OS_VERSION: navigator.userAgent,
        });
        document.body.style.backgroundColor = config.BACKGROUND_COLOR || DEFAULT_BACKGROUND_COLOR;
        window.Shell = {
            defined: false,
            define(UIClass) {
                if (this.defined) {
                    return;
                }
                this.defined = true;
                this.UIClass = UIClass;
                const app = new window.Shell.UIClass(window.NativeBus, config);
                if (!(app.root instanceof HTMLElement)) {
                    throw new Error('Could not run app: the property \'root\' in your App class is not of type HTMLElement');
                }
                document.body.appendChild(app.root);
            },
        };
        import(window.KitAppShellConfig ? window.KitAppShellConfig.APP_SRC : config.APP_SRC);
    });

