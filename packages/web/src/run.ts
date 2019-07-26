import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import { serve } from './serve';
import chalk from 'chalk';
import { AddressInfo } from 'net';
import { IRun } from '@kano/kit-app-shell-core/lib/types';
import * as livereload from 'livereload';
import { Bundler } from '@kano/kit-app-shell-core/lib/bundler';
import * as rimrafCb from 'rimraf';
import * as path from 'path';
import { getCachePath } from '@kano/kit-app-shell-core/lib/tmp';

import { promisify } from 'util';
import { copyResources, IResources } from './copy-resources';

const rimraf = promisify(rimrafCb);

interface IWebRunOptions {
    app : string;
    config : any;
    port : number;
    additionalResources? : IResources;
}

const DEFAULT_BACKGROUND_COLOR = '#ffffff';

const webRun : IRun = (opts : IWebRunOptions) => {
    const {
        app,
        config = {},
        port = 8000,
        additionalResources = [],
    } = opts;

    const tmp = path.join(getCachePath(), 'web');

    // Build the shell in a tmp directory. This is required to get all native APIs working
    return rimraf(tmp)
        .then(() => copyResources(additionalResources, tmp, app))
        .then(() => Bundler.bundle(
            `${__dirname}/../www/index.html`,
            `${__dirname}/../www/shell.js`,
            `${__dirname}/../www/run.js`,
            config,
            {
                js: {
                    bundleOnly: true,
                },
                appJs: {
                    bundleOnly: true,
                },
                html: {
                    replacements: {
                        head: `<style>
                            html, body {
                                background-color: ${config.BACKGROUND_COLOR || DEFAULT_BACKGROUND_COLOR};
                            }
                        </style>`,
                    },
                },
            },
        ))
        .then((bundle) => Bundler.write(bundle, tmp))
        .then(() => {
            const server = serve(app, tmp, opts).listen(port);
            const livereloadServer = livereload.createServer();

            config.LR_URL = 'http://localhost:35729';
            livereloadServer.watch(app);

            server.on('listening', () => {
                const address = server.address() as AddressInfo;
                processState.setInfo(`Serving ${chalk.blue(app)} at ${chalk.green(`http://localhost:${address.port}`)}`);
            });

            // Never resolves, to let the CLI hang while the server runs
            return new Promise(() => null);
        });

};

export default webRun;
