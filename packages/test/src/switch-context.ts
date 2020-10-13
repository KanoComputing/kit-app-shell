import * as wdjs from 'wd';
type wdjs = typeof wdjs;

export function switchContexts(wd : wdjs, driver : wdjs.WebDriver, index : number) {
    const asserter = new wd.Asserter<wdjs.Context[]>((target: any, cb: any): any => {
        driver.contexts()
            .then((ctxs) => {
                cb(null, ctxs.length > 1, ctxs);
            })
            .catch((e) => cb(e));
    });
    return driver.waitFor<wdjs.Context[]>(asserter)
        .then((ctxs) => driver.context(ctxs[index]));
}
