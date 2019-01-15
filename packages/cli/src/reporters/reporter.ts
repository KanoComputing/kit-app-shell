export interface IReporter {
    onStep(message : string);
    onSuccess(message : string);
    onFailure(message : Error);
    onWarning(message : string);
    onInfo(message : string);
}
