import { IReporter } from './reporter';

export default class ConsoleReporter implements IReporter {
    onStep(message : string) : void {
        // tslint:disable-next-line:no-console
        console.log(message);
    }
    onSuccess(message : string) : void {
        // tslint:disable-next-line:no-console
        console.log(message);
    }
    onFailure(message : Error) : void {
        // tslint:disable-next-line:no-console
        console.error(message);
    }
    onWarning(message : string) : void {
        // tslint:disable-next-line:no-console
        console.log(message);
    }
    onInfo(message : string) : void {
        // tslint:disable-next-line:no-console
        console.log(message);
    }
}
