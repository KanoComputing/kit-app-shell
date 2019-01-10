import { EventEmitter } from 'events';

/**
 * Progress tracker for rollup.
 * Create a tracker, use it as a plugin with `tracker.plugin()`
 * Listen to the `progress` event to get info about the
 * Total loaded files and the current file being processed
 */
export class ProgressTracker extends EventEmitter {
    loaded : number = 0;
    plugin() {
        const self = this;
        return {
            name: 'progress',
            load(id : string) : void {
                self.loaded += 1;
                self.emit('progress', {
                    loaded: self.loaded,
                    file: id,
                });
            },
        };
    }
}
