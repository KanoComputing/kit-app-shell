import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import { serve } from '@kano/kit-app-shell-cordova/lib/run';
import chalk from 'chalk';
import * as path from 'path';
import { AddressInfo } from 'net';
import { IRun, IRunOptions, IKashConfig } from '@kano/kit-app-shell-core/lib/types';
import * as livereload from 'livereload';
import { generateProject } from './project';
import { buildUWPApp } from './msbuild';
import { Bundler } from '@kano/kit-app-shell-core/lib/bundler';
import { copyPolyfills } from './polyfills';
import { getDevCertPath } from './cert';

type IUWPRunOptions = IRunOptions & {
    port : number;
    certificates : { [K : string] : string };
};

const webRun : IRun = (opts : IUWPRunOptions) => {
    const { app, config = {} as IKashConfig, port = 8000 } = opts;
    const server = serve(app, opts.config.ENV, {}).listen(port);
    const livereloadServer = livereload.createServer();

    config.LR_URL = 'http://localhost:35729';
    livereloadServer.watch(app);

    server.on('listening', () => {
        const address = server.address() as AddressInfo;
        processState.setInfo(`Serving ${chalk.blue(app)} at ${chalk.green(`http://localhost:${address.port}`)}`);
    });

    const baseUrl = `ms-appx-web://${config.UWP.PACKAGE_NAME}/www/`;

    const certPath = getDevCertPath(opts);

    if (!certPath) {
        throw new Error(`Could not prepare UWP project: You do not have a development certificate. Run ${chalk.cyan('kash configure uwp')} to generate one`);
    }

    return generateProject(path.join(__dirname, '../template'), opts, certPath)
        .then((paths) => {
            const wwwPath = path.join(paths.project, 'www');
            return copyPolyfills(wwwPath)
                .then((injectNames) => {
                    // Bundle the cordova shell and provided app into the www directory
                    return Bundler.bundle(
                        require.resolve('../www/index.html'),
                        require.resolve('../www/index.js'),
                        path.join(__dirname, '../www/run.js'),
                        opts.config,
                        {
                            appJs: {
                                replaces: [{
                                    values: {
                                        TUNNEL_URL: `'http://localhost:${port}'`,
                                    },
                                }],
                            },
                            js: {
                                bundleOnly: opts.bundleOnly,
                                targets: opts.targets,
                                replaces: [{
                                    // Avoid jsZip to detect the define from requirejs
                                    // TODO: Scope this to the jszip file
                                    values: {
                                        'typeof define': 'undefined',
                                    },
                                }],
                            },
                            html: {
                                replacements: {
                                    injectScript: injectNames.map((name) => `<script src="${name}"></script>`).join(''),
                                    base: `<base href="${baseUrl}">`,
                                },
                            },
                        },
                    ).then((bundle) => Bundler.write(bundle, wwwPath));
                })
                .then(() => {
                    return buildUWPApp(paths.solution);
                })
                .then((bundle) => {
                    console.log(bundle);
                });
        })
        // Never resolves, to let the CLI hang while the server runs
        .then(() => new Promise(() => null));
};

export default webRun;
