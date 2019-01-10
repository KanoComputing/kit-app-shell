/* eslint no-console: 'off' */
import { IReporter } from './reporter';

export default class ConsoleReporter implements IReporter {
    start() {}
    stop() {}
    onStep(message : string) : void {
        console.log(message);
    }
    onSuccess(message : string) : void {
        console.log(message);
    }
    onFailure(message : Error) : void {
        console.error(message);
    }
    onWarning(message : string) : void {
        console.log(message);
    }
    onInfo(message : string) : void {
        console.log(message);
    }
}
