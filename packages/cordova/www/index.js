import Devices from '@kano/devices-sdk-cordova/index.js';
import { DevicesServer } from '@kano/web-bus/esm/servers/index.js';
import EventEmitter from './lib/event-emitter.js';
import { updaterBus } from './lib/bus/updater.js';
import { AuthServer } from './lib/bus/auth.js';
import { IABServer } from './lib/bus/iab.js';
import { Context } from '@kano/kit-app-shell-core/www/index.js';
import { OscillatorNode } from 'standardized-audio-context';

const logger = {};

['trace', 'debug', 'info', 'warn', 'error', 'log'].forEach((name) => {
    logger[name] = (...args) => console.log(...args);
});

Devices.setLogger(logger);

const bus = new EventEmitter();
const adapter = new DevicesServer(bus, Devices);

updaterBus(bus);
const auth = new AuthServer(bus);
const iab = new IABServer(bus);

window.NativeBus = bus;

// Fix for ios14 which doesn't provide the OscillatorNode constructor in the window by default (consumed by Tone.js) and throws error blocking require.js main thread to render app.
// https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode/OscillatorNode
window.OscillatorNode = OscillatorNode;

window.Shell = {
    defined: false,
    define(UIClass) {
        if (this.defined) {
            return;
        }
        this.defined = true;
        this.UIClass = UIClass;
        const context = new Context(window.NativeBus, window.KitAppShellConfig);
        const app = new window.Shell.UIClass(context);
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

    function boot() {
        import(window.KitAppShellConfig.APP_SRC);
        return window.KitAppShellConfig;
    }

    // This string will be in the search part of the url when automated for tests
    if (location.search.indexOf('__kash_automated__') !== -1) {
        window.__kash_boot__ = boot;
    } else {
        boot();
    }
});
