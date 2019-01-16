import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import { serve } from './serve';
import chalk from 'chalk';
import { AddressInfo } from 'net';
import { IRun } from '@kano/kit-app-shell-core/lib/types';

interface IWebRunOptions {
    app : string;
    config : any;
    port : number;
}

const webRun : IRun = ({ app, config = {}, port = 8000 } : IWebRunOptions) => {
    const server = serve(app, config).listen(port);

    server.on('listening', () => {
        const address = server.address() as AddressInfo;
        processState.setInfo(`Serving ${chalk.blue(app)} at ${chalk.green(`http://localhost:${address.port}`)}`);
    });

    // Never resolves, to let the CLI hang while the server runs
    return new Promise(() => null);
};

export default webRun;
