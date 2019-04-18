import EventEmitter from './lib/event-emitter.js';
import { DevicesServer } from '@kano/web-bus/esm/servers/index';
import Devices from '@kano/devices-sdk-uwp/index.js';
import { UpdaterServer } from './lib/updater.js';
import { applyTitleBarCustomisations } from './lib/titlebar.js';
import { getVersion } from './lib/version.js';

const logger = {};

['trace', 'debug', 'info', 'warn', 'error', 'log'].forEach((name) => {
    logger[name] = (...args) => console.log(...args);
});

Devices.setLogger(logger);

const bus = new EventEmitter();

const adapter = new DevicesServer(bus, Devices);
const updaterServer = new UpdaterServer(bus);

window.NativeBus = bus;

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

Object.assign(window.KitAppShellConfig, {
    OS_PLATFORM: 'UWP',
    OS_VERSION: getVersion(),
    UI_ROOT: `ms-appx-web://${window.KitAppShellConfig.UWP.PACKAGE_NAME}/www/www/`,
});

applyTitleBarCustomisations(window.KitAppShellConfig);

function boot(launchActivatedEventArgs) {
    Object.assign(window.KitAppShellConfig, { launchActivatedEventArgs });
    import(window.KitAppShellConfig.APP_SRC)
        .catch(e => console.error(e));
    return window.KitAppShellConfig;
}

if (window.launchActivatedEventArgs) {
    boot(window.launchActivatedEventArgs)
} else {
    window.addEventListener('activated', (e) => boot(e), false);
}
