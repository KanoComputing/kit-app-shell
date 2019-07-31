import * as wdjs from 'wd';

export function switchContexts(wd : wdjs, driver : wdjs.WebDriver, index : number) {
    const asserter = new wd.Asserter<wdjs.Context[]>((target, cb) => {
        driver.contexts()
            .then((ctxs) => {
                cb(null, ctxs.length > 1, ctxs);
            })
            .catch((e) => cb(e));
    });
    return driver.waitFor<wdjs.Context[]>(asserter)
        .then((ctxs) => driver.context(ctxs[index]));
}
