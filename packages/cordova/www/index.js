import Devices from '@kano/devices-sdk/platforms/cordova/index.js';
import BusAdapter from '@kano/devices-sdk/bus-adapter/bus-adapter.js';
import EventEmitter from './lib/event-emitter.js';
import { updaterBus } from './lib/bus/updater.js';

const logger = {};

['trace', 'debug', 'info', 'warn', 'error', 'log'].forEach((name) => {
    logger[name] = (...args) => console.log(...args);
});

Devices.setLogger(logger);

const bus = new EventEmitter();
const adapter = new BusAdapter({ bus, Devices });

updaterBus(bus);

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

document.addEventListener('deviceready', () => {
    Object.assign(window.KitAppShellConfig, {
        OS_PLATFORM: device.platform,
        OS_VERSION: device.version,
    });
    
    import(window.KitAppShellConfig.APP_SRC);
});
