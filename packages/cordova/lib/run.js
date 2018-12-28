const processState = require('@kano/kit-app-shell-core/lib/process-state');
const ConfigLoader = require('@kano/kit-app-shell-core/lib/config');
const Bundler = require('@kano/kit-app-shell-core/lib/bundler');
const project = require('./project');
const ngrok = require('ngrok');
const connect = require('connect');
const path = require('path');
const serveStatic = require('serve-static');
const cors = require('cors');
const { cordova } = require('cordova-lib');
const ip = require('ip');
const livereload = require('livereload');

const namedResolutionMiddleware = require('@kano/es6-server/named-resolution-middleware');

// Finding the machine's IP address in a local network can be unreliable
// This allows users to define the name of their network interface
const { KASH_NET_INTERFACE_NAME } = process.env;

/**
 * Serves the app, resolve named modules, create an endpoint to GET the config
 * @param {String} app Path to the app to run
 */
function serve(app) {
    return connect()
        .use(cors())
        .use((req, res, next) => {
            if (req.method === 'GET') {
                if (req.url === '/_config') {
                    // Load on every request to get the latest config
                    const config = ConfigLoader.load(app);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    config.APP_SRC = './www/index.js';
                    return res.end(JSON.stringify(config));
                }
            }
            next();
        })
        .use(namedResolutionMiddleware({ root: app }))
        .use(serveStatic(app));
}

/**
 * Create a server and tunnels it using ngrok
 * Also creates a livereload server and watches the files in the app directory
 * @param {String} app Path to the app to tunnel
 */
function setupTunnel(app) {
    const server = serve(app).listen(0);
    const { port } = server.address();
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

module.exports = (opts) => {
    return Promise.all([
        setupTunnel(opts.app),
        project.getProject({
            ...opts,
            skipCache: !opts.cache,
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
                        replaces: {
                            TUNNEL_URL: `'${server.tunnel.url}'`,
                            LR_URL: `'http://${ip.address(KASH_NET_INTERFACE_NAME)}:35729'`,
                        },
                    },
                    js: {
                        replaces: {
                            // Avoid jsZip to detect the define from requirejs
                            'typeof define': 'undefined',
                        },
                    },
                })
                .then(bundle => Bundler.write(bundle, wwwPath))
                .then(() => processState.setStep('Starting dev app on device'))
                .then(() => {
                    const platformIds = opts.platforms.map(platform => path.basename(platform).replace('cordova-', ''));
                    return cordova.run({ platforms: platformIds });
                })
                .then(() => processState.setSuccess('Dev app started'))
                .then(() => projectPath)
                .catch((e) => {
                    server.stop();
                    throw e;
                });
        });
};
