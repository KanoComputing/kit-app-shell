import EventEmitter from './lib/event-emitter.js';
import BusAdapter from '@kano/devices-sdk/bus-adapter/bus-adapter.js';
import Devices from './uwp/index.js';

const logger = {};

['trace', 'debug', 'info', 'warn', 'error', 'log'].forEach((name) => {
    logger[name] = (...args) => console.log(...args);
});

Devices.setLogger(logger);

const bus = new EventEmitter();

const adapter = new BusAdapter({ bus, Devices });

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
    OS_VERSION: 'alpha',
});
// Object.assign(window.KitAppShellConfig, {
//     UI_ROOT: '/www/',
// });
Object.assign(window.KitAppShellConfig, {
    UI_ROOT: 'ms-appx-web://kash/www/www/',
});

import(window.KitAppShellConfig.APP_SRC);
