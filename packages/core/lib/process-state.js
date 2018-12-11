const { EventEmitter } = require('events');

// TODO: Rename to better name. Breaks dependencies so test are important
// TODO: Find better name. Something like StepManager as it manages steps
class ProcessState extends EventEmitter {
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

module.exports = new ProcessState();
