const { EventEmitter } = require('events');

/**
 * Progress tracker for rollup.
 * Create a tracker, use it as a plugin with `tracker.plugin()`
 * Listen to the `progress` event to get info about the
 * Total loaded files and the current file being processed
 */
class ProgressTracker extends EventEmitter {
    constructor() {
        super();
        this.loaded = 0;
    }
    plugin() {
        const self = this;
        return {
            name: 'progress',
            load(id) {
                self.loaded += 1;
                self.emit('progress', {
                    loaded: self.loaded,
                    file: id,
                });
            },
        };
    }
}

module.exports = ProgressTracker;
