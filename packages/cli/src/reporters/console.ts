/* eslint no-console: 'off' */
import { IReporter } from './reporter';

export default class ConsoleReporter implements IReporter {
    start() {}
    stop() {}
    onStep(message : string) {
        console.log(message);
    }
    onSuccess(message : string) {
        console.log(message);
    }
    onFailure(message : Error) {
        console.error(message);
    }
    onWarning(message : string) {
        console.log(message);
    }
    onInfo(message : string) {
        console.log(message);
    }
}
