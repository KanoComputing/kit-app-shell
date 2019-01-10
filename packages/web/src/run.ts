import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import  { serve } from './serve';
import chalk from 'chalk';
import { AddressInfo } from 'net';

type WebRunOptions = {
    app : string;
    config : any;
    port : number;
};

export default function run({ app, config = {}, port = 8000 } : WebRunOptions) {
    const server = serve(app, config).listen(port);

    const address = server.address() as AddressInfo;

    processState.setInfo(`Serving ${chalk.blue(app)} at ${chalk.green(`http://localhost:${address.port}`)}`);

    // Never resolves, to let the CLI hang while the server runs
    return new Promise(() => {});
};
