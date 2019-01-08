"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class ProgressTracker extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
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
exports.ProgressTracker = ProgressTracker;
//# sourceMappingURL=progress.js.map