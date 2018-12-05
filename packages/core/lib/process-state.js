const { EventEmitter } = require('events');

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
