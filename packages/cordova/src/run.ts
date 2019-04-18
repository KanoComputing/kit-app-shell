import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import { ConfigLoader } from '@kano/kit-app-shell-core/lib/config';
import { IConfigOverrides } from '@kano/kit-app-shell-core/lib/types';
import { Bundler } from '@kano/kit-app-shell-core/lib/bundler';
import { getProject } from './project';
import * as ngrok from 'ngrok';
import * as connect from 'connect';
import * as path from 'path';
import * as serveStatic from 'serve-static';
import * as cors from 'cors';
import { cordova } from 'cordova-lib';
import * as ip from 'ip';
import * as livereload from 'livereload';
import { AddressInfo } from 'net';
import { CordovaRunOptions } from './types';
import { IRun } from '@kano/kit-app-shell-core/lib/types';

import * as namedResolutionMiddleware from '@kano/es6-server/named-resolution-middleware';

// Finding the machine's IP address in a local network can be unreliable
// This allows users to define the name of their network interface
const { KASH_NET_INTERFACE_NAME } = process.env;

/**
 * Serves the app, resolve named modules, create an endpoint to GET the config
 * @param app Path to the app to run
 * @param env Target environment.
 * @param configOverrides Config options passed through the CLI.
 */
export function serve(app : string, env : string, overrides : IConfigOverrides) : connect.Server {
    return connect()
        .use(cors())
        .use((req, res, next) => {
            if (req.method === 'GET') {
                if (req.url === '/_config') {
                    // Load on every request to get the latest config
                    const config = ConfigLoader.load(app, env, overrides);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    config.APP_SRC = './www/index.js';
                    return res.end(JSON.stringify(config));
                }
            }
            return next();
        })
        .use(namedResolutionMiddleware({ root: app }))
        .use(serveStatic(app));
}

interface ITunnel {
    tunnel : {
        url : string;
    };
    stop();
}

/**
 * Create a server and tunnels it using ngrok
 * Also creates a livereload server and watches the files in the app directory
 *
 * @param app Path to the app to tunnel.
 * @param env Target environment.
 * @param configOverrides Config options passed through the CLI.
 */
function setupTunnel(app : string, env : string, overrides : IConfigOverrides) : Promise<ITunnel> {
    const server = serve(app, env, overrides).listen(0);
    const { port } = server.address() as AddressInfo;
    // TODO: Move this to core. It can be re-used to live-reload any platform or project
    const lrServer = livereload.createServer();
    return ngrok.connect(port)
        .then((url) => {
            lrServer.watch(app);
            return {
                tunnel: {
                    url,
                },
                stop() {
                    ngrok.disconnect(url);
                    server.close();
                },
            };
        });
}

const cordovaRun : IRun = (opts : CordovaRunOptions) => Promise.all([
    setupTunnel(opts.app, opts.env, opts['override-app-config']),
    getProject({
        ...opts,
        skipCache: opts['no-cache'],
    }),
])
    .then(([server, projectPath]) => {
        const wwwPath = path.join(projectPath, 'www');
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
                            TUNNEL_URL: `'${server.tunnel.url}'`,
                            LR_URL: `'http://${ip.address(KASH_NET_INTERFACE_NAME)}:35729'`,
                        },
                    }],
                },
                js: {
                    replaces: [{
                        values: {
                            // Avoid jsZip to detect the define from requirejs
                            'typeof define': 'undefined',
                        },
                    }],
                },
                html: {},
            },
        )
            .then((bundle) => Bundler.write(bundle, wwwPath))
            .then(() => processState.setInfo('Starting dev app on device'))
            .then(() => {
                const platformIds = opts.platforms.map((platform) => path.basename(platform).replace('cordova-', ''));
                return cordova.run({ platforms: platformIds });
            })
            .then(() => {
                processState.setSuccess('Dev app started');
                return new Promise(() => null);
            })
            .catch((e) => {
                server.stop();
                throw e;
            });
    });

export default cordovaRun;
