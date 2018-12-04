const { app } = require('electron');
const createUpdater = require('../updater');

let updater;

function response(event, data) {
    return {
        eventId: event.eventId,
        data
    };
}

module.exports = (bus, log) => {
    bus.on('req', (event) => {
        switch (event.name) {
        case 'setup': {
            if (updater) {
                log.trace('Updater already setup');
                bus.emit('res', response(event, false));
                return;
            }
            updater = createUpdater(event.data);
            bus.emit('res', response(event, true));
            log.trace('Updater setup success');
            const events = [
                'checking-for-update',
                'update-available',
                'update-not-available',
                'update-downloaded',
                'before-quit-for-update',
            ];
            events.forEach(e => updater.on(e, (...args) => bus.emit(e, ...args)));
            break;
        }
        case 'check-for-updates': {
            if (!updater) {
                return;
            }
            log.info('Checking for updates');
            updater.checkForUpdates();
            bus.emit('res', response(event));
            break;
        }
        case 'quit-and-install': {
            if (!updater) {
                return;
            }
            log.info('Quit and install requested');
            if (process.platform === 'win32') {
                app.quit();
            }
            updater.quitAndInstall();
            bus.emit('res', response(event));
            break;
        }
        }
    });
};
