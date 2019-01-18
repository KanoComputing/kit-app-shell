export enum CheckResultSatus {
    Success,
    Warning,
    Failure,
}

export interface ICheckResult {
    status : CheckResultSatus;
    title : string;
    message? : string;
}

export interface ICheck {
    children : ICheck[];
    run() : Promise<ICheckResult>;
}

export function runChecks(checks : ICheck[]) : Promise<ICheckResult[]> {
    return Promise.all(checks.map((check) => check.run()));
}
