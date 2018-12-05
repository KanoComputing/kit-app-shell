function response(event, data) {
    return {
        eventId: event.eventId,
        data
    };
}

/**
 * No updater for this shell, just return false during setup
 */
export const updaterBus = (bus) => {
    bus.on('req', (event) => {
        switch (event.name) {
        case 'setup': {
            bus.emit('res', response(event, false));
            break;
        }
        case 'check-for-updates': {
            bus.emit('res', response(event));
            break;
        }
        case 'quit-and-install': {
            bus.emit('res', response(event));
            break;
        }
        }
    });
};

export default updaterBus;
