import { IProvider } from '../types';
import * as chromedriver from 'chromedriver';
import * as wdjs from 'wd';

const chromeProvider : IProvider = (app, wd : wdjs, ctx, opts) => {
    chromedriver.start(['--url-base=wd/hub', '--port=9515']);

    ctx.afterAll(() => {
        chromedriver.stop();
    });

    const builder = () => {
        const driver : wdjs.Driver = wd.promiseChainRemote('0.0.0.0', 9515);
        ctx.beforeEach(() => {
            return driver.get(`${app}?__kash_automated__`)
                .then(() => {
                    return driver.waitForConditionInBrowser('!!window.__kash_boot__');
                });
        });
        return driver.init({ browserName: 'chrome' }).then(() => driver);
    };
    return Promise.resolve(builder);
};

export default chromeProvider;
