const { app, ipcMain } = require('electron');
const { Shell } = require('@kano/desktop-shell');
const updaterBusAdapter = require('./bus/updater');
const path = require('path');

const CONTENT_SCHEME = 'kit-app';
const CONTENT_ROOT = path.join(__dirname, '../');

const Devices = require('@kano/devices-sdk/platforms/nodejs');
const BusAdapter = require('@kano/devices-sdk/bus-adapter');
const ElectronIpcBus = require('@kano/devices-sdk/bus-adapter/bus/electron-ipc');

const postProcessFactory = require('./post-process');
const getPlatformData = require('./platform');

const DEFAULTS = {
    APP_NAME: 'Kano Desktop Application',
};

const DEFAULT_BACKGROUND_COLOR = '#ffffff';

class App {
    static getIcon(config) {
        if (process.platform !== 'darwin' || !config.ICONS || !config.ICONS.WINDOWS) {
            return null;
        }
        return path.join(appDir, this.config.ICONS.WINDOWS);
    }
    constructor(appDir, config, args) {
        this.config = Object.assign({}, DEFAULTS, require(config));

        if (args.profile) {
            this.config.PROFILE = args.profile;
        }

        this.config.APP_SRC = 'kit-app://app/index.js';
        this.config.UI_ROOT = 'kit-app://app/';

        Object.assign(this.config, getPlatformData());

        const postProcess = this.config.BUNDLED ? null : postProcessFactory(appDir);

        const icon = App.getIcon(config);

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
            server: {
                postProcess,
                authorities: {
                    // An authority of 'app' will resolve to the appDir
                    app: appDir,
                },
            },
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
                backgroundColor: config.BACKGROUND_COLOR || DEFAULT_BACKGROUND_COLOR,
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
            // Allow the updater to be disabled from the config
            if (!this.config.UPDATER_DISABLED) {
                // Binds the updater events with the updater module
                updaterBusAdapter(this.bus, this.shell.log);
            }
            Devices.setLogger(this.shell.log);
        } else {
            // Subsequent windows, just update the window reference in the bus
            this.bus.setWindow(shell.window);
        }
    }
}

module.exports = App;
