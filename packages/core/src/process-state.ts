import { EventEmitter } from 'events';

// TODO: Rename to better name. Breaks dependencies so test are important
// TODO: Find better name. Something like StepManager as it manages steps
class ProcessState extends EventEmitter {
    setStep(message : string) : void {
        this.emit('step', { message });
    }
    setSuccess(message : string) : void {
        this.emit('success', { message });
    }
    setFailure(message : Error) : void {
        this.emit('failure', { message });
    }
    setWarning(message : string) : void {
        this.emit('warning', { message });
    }
    setInfo(message : string) : void {
        this.emit('info', { message });
    }
}

export const processState = new ProcessState();
