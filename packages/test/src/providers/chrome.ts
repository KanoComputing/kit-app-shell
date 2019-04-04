import { IProvider } from '../types';
import * as chromedriver from 'chromedriver';
import { serve } from '../serve';

const chromeProvider : IProvider = (app, wd, mocha, opts) => {
    chromedriver.start(['--url-base=wd/hub', '--port=9515']);

    const server = serve(app);

    server.listen(2345);

    mocha.suite.afterAll(() => {
        chromedriver.stop();
    });

    const builder = () => {
        const driver = wd.promiseChainRemote('0.0.0.0', 9515);
        mocha.suite.beforeEach(() => {
            return driver.get('http://localhost:2345');
        });
        return driver.init({ browserName: 'chrome' }).then(() => driver);
    };
    return Promise.resolve(builder);
};

export default chromeProvider;
