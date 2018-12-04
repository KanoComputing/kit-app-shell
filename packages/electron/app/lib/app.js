const { app, ipcMain } = require('electron');
const { Shell } = require('@kano/desktop-shell');
const updaterBusAdapter = require('./bus/updater');
const path = require('path');

const CONTENT_SCHEME = 'kit-app';
const CONTENT_ROOT = path.join(__dirname, '../');

const loadConfig = require('./config');

const Devices = require('@kano/devices-sdk/platforms/nodejs');
const BusAdapter = require('@kano/devices-sdk/bus-adapter');
const ElectronIpcBus = require('@kano/devices-sdk/bus-adapter/bus/electron-ipc');

const postProcessFactory = require('./post-process');

class App {
    constructor(entryArg, args) {
        this.config;

        if (!entryArg) {
            try {
                this.config = loadConfig(path.join(__dirname, '../www'));
            } catch (e) {
                throw new Error('The shell requires an entry');
            }
        } else {
            const entry = path.resolve(entryArg);
            this.config = loadConfig(entry);
        }

        if (args.profile) {
            this.config.PROFILE = args.profile;
        }

        const postProcess = this.config.MODULE_TYPE === 'es' ? postProcessFactory(this.config.ENTRY) : null;

        const icon = process.platform !== 'darwin' ? path.join(this.config.ENTRY, this.config.ICONS.WINDOWS) : null;

        this.shell = new Shell({
            name: this.config.APP_NAME,
            version: this.config.UI_VERSION,
            root: CONTENT_ROOT,
            scheme: CONTENT_SCHEME,
            width: 1440,
            height: 900,
            preload: path.join(__dirname, '../preload.js'),
            devMode: this.config.ENV === 'development',
            uwpTitlebar: false,
            menuTransform(menu) {
                return menu;
            },
            server: { postProcess },
            log: {
                level: 'warn',
                file: {
                    level: 'warn',
                    period: '1d',
                    count: 7,
                },
                devMode: {
                    level: 'trace',
                    file: {
                        level: 'trace',
                    },
                },
            },
            windowOptions: {
                icon,
                show: false,
                autoHideMenuBar: true,
            }
        });

        app.on('before-quit', this._onBeforeQuit.bind(this));
        
        app.on('ready', this._onReady.bind(this));
        
        this.shell.on('window-created', this._onWindowCreated.bind(this));
        
        // Allows preload script to have access to the config
        global.config = this.config;
    }
    _onReady() {
        this.shell.createWindow();
    }
    _onBeforeQuit() {
        Devices.terminate();
    }
    _onWindowCreated() {
        if (!this.bus) {
            // First window created, setup the bus and adapters
            this.bus = new ElectronIpcBus(ipcMain, this.shell.window);
            this.adapter = new BusAdapter({ bus: this.bus, Devices });
            // Binds the updater events with the updater module
            updaterBusAdapter(this.bus, this.shell.log);
            Devices.setLogger(this.shell.log);
        } else {
            // Subsequent windows, just update the window reference in the bus
            this.bus.setWindow(shell.window);
        }
    }
}

module.exports = App;
