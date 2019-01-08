export interface IReporter {
    start(message : string);
    stop(message : string);
    onStep(message : string);
    onSuccess(message : string);
    onFailure(message : Error);
    onWarning(message : string);
    onInfo(message : string);
}
