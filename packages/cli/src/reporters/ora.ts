import * as ora from 'ora';
import { IReporter } from './reporter';

export default class OraReporter implements IReporter {
    spinner : ora.Ora;
    start() {}
    stop() {}
    getSpinner() : ora.Ora {
        if (!this.spinner || !this.spinner.isSpinning) {
            this.spinner = ora('').start();
        }
        return this.spinner;
    }
    onStep(message : string) : void {
        this.getSpinner().text = message;
    }
    onSuccess(message : string) : void {
        this.getSpinner().succeed(message);
    }
    onFailure(message : Error) : void {
        this.getSpinner().fail(message.stack || message.toString());
    }
    onWarning(message : string) : void {
        this.getSpinner().warn(message);
    }
    onInfo(message : string) : void {
        this.getSpinner().info(message);
    }
    dispose() : void {
        this.getSpinner().stop();
    }
}
