const { app } = require('electron');
const { ChannelServer } = require('@kano/web-bus/cjs/server');
const { UpdaterChannelId, UpdaterMethod } = require('@kano/web-bus/cjs/apis/updater/definition');
const createUpdater = require('../updater');

let updater;

class UpdaterServer extends ChannelServer {
    constructor(bus, log) {
        super(bus, UpdaterChannelId);
        this.log = log;

        this.currentCallback = null;

        this.listen(UpdaterMethod.SETUP, req => this.setup(req.params[0]));
        this.listen(UpdaterMethod.CHECK_FOR_UPDATES, () => this.checkForUpdates());
        this.listen(UpdaterMethod.QUIT_AND_INSTALL, () => this.quitAndInstall());
    }
    setup(config) {
        if (updater) {
            this.log.trace('Updater already setup');
            return Promise.resolve(false);
        }
        updater = createUpdater(config);
        this.log.trace('Updater setup success');
        updater.on('checking-for-update', (...args) => this.emit(UpdaterMethod.CHECKING_FOR_UPDATE_EVENT, ...args));
        updater.on('update-available', (...args) => this.emit(UpdaterMethod.UPDATE_AVAILABLE_EVENT, ...args));
        updater.on('update-not-available', (...args) => this.emit(UpdaterMethod.UPDATE_NOT_AVAILABLE_EVENT, ...args));
        updater.on('update-downloaded', (...args) => this.emit(UpdaterMethod.UPDATE_DOWNLOADED_EVENT, ...args));
        updater.on('before-quit-for-update', (...args) => this.emit(UpdaterMethod.BEFORE_QUIT_FOR_UPDATE_EVENT, ...args));
        return Promise.resolve(true);
    }
    checkForUpdates() {
        if (!updater) {
            return Promise.reject(new Error('Could not check for updates: updater not setup'));
        }
        this.log.info('Checking for updates');
        updater.checkForUpdates();
        return Promise.resolve();
    }
    quitAndInstall() {
        if (!updater) {
            return Promise.reject(new Error('Could not quit and install: updater not setup'));
        }
        this.log.info('Quit and install requested');
        if (process.platform === 'win32') {
            app.quit();
        }
        updater.quitAndInstall();
        return Promise.resolve();
    }
}

module.exports = (bus, log) => {
    const s = new UpdaterServer(bus, log);
};
