import { EventEmitter } from 'events';

// TODO: Rename to better name. Breaks dependencies so test are important
// TODO: Find better name. Something like StepManager as it manages steps
class ProcessState extends EventEmitter {
    setStep(message : string) {
        this.emit('step', { message });
    }
    setSuccess(message : string) {
        this.emit('success', { message });
    }
    setFailure(message : Error) {
        this.emit('failure', { message });
    }
    setWarning(message : string) {
        this.emit('warning', { message });
    }
    setInfo(message : string) {
        this.emit('info', { message });
    }
}

export const processState = new ProcessState();
