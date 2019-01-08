"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class ProcessState extends events_1.EventEmitter {
    setStep(message) {
        this.emit('step', { message });
    }
    setSuccess(message) {
        this.emit('success', { message });
    }
    setFailure(message) {
        this.emit('failure', { message });
    }
    setWarning(message) {
        this.emit('warning', { message });
    }
    setInfo(message) {
        this.emit('info', { message });
    }
}
exports.processState = new ProcessState();
//# sourceMappingURL=process-state.js.map