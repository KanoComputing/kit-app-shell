// import { AuthServer } from './lib/auth.js';

class FakeBus {
    on() {}
    addListener() {}
    removeListener() {}
    emit() {}
}

window.NativeBus = new FakeBus();

// TODO: Turn this on once this platform builds its shell before serving
// const auth = new AuthServer(window.NativeBus);

function getJSON(url) {
    return fetch(url)
        .then(r => r.json());
}

function setupLivereload(url) {
    const s = document.createElement('script');
    s.src = `${url}/livereload.js?snipver=1`;
    document.body.appendChild(s);
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

        if (config.LR_URL) {
            setupLivereload(config.LR_URL);
        }

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
        function boot() {
            import(window.KitAppShellConfig ? window.KitAppShellConfig.APP_SRC : config.APP_SRC)
                .catch(e => console.error(e));
            return config;
        }
        // This string will be in the search part of the url when automated for tests
        if (location.search.indexOf('__kash_automated__') !== -1) {
            window.__kash_boot__ = boot;
        } else {
            boot();
        }
    });
