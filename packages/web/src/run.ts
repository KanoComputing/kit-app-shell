import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import { serve } from './serve';
import chalk from 'chalk';
import { AddressInfo } from 'net';
import { IRun } from '@kano/kit-app-shell-core/lib/types';
import * as livereload from 'livereload';

interface IWebRunOptions {
    app : string;
    config : any;
    port : number;
}

const webRun : IRun = (opts : IWebRunOptions) => {
    const { app, config = {}, port = 8000 } = opts;
    const server = serve(app, opts).listen(port);
    const livereloadServer = livereload.createServer();

    config.LR_URL = 'http://localhost:35729';
    livereloadServer.watch(app);

    server.on('listening', () => {
        const address = server.address() as AddressInfo;
        processState.setInfo(`Serving ${chalk.blue(app)} at ${chalk.green(`http://localhost:${address.port}`)}`);
    });

    // Never resolves, to let the CLI hang while the server runs
    return new Promise(() => null);
};

export default webRun;
