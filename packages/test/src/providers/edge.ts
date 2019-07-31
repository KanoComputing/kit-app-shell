import { IProvider } from '../types';
import * as edgedriver from '../drivers/edge';
import { serve } from '../serve';

const chromeProvider : IProvider = (app, wd, ctx, opts) => {
    edgedriver.start(['--port=17557']);

    const server = serve(app);

    server.listen(2345);

    ctx.afterAll(() => {
        edgedriver.stop();
    });

    const builder = () => {
        const driver = wd.promiseChainRemote('0.0.0.0', 17557);
        ctx.beforeEach(() => {
            return driver.get('http://localhost:2345');
        });
        return driver.init({ browserName: 'MicrosoftEdge' }).then(() => driver);
    };
    return Promise.resolve(builder);
};

export default chromeProvider;
