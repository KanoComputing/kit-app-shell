const { ConfigLoader, Bundler, processState } = require('@kano/kit-app-shell-core');
const { project } = require('@kano/kit-app-shell-cordova');
const { promisify } = require('util');
const localtunnel = promisify(require('localtunnel'));
const connect = require('connect');
const path = require('path');
const serveStatic = require('serve-static');
const cors = require('cors');
const androidPlatform = require('./plugins');
const { cordova } = require('cordova-lib');
const livereload = require('livereload');

const namedResolutionMiddleware = require('@kano/es6-server/named-resolution-middleware');

function serve(app) {
    return connect()
        .use(cors())
        .use((req, res, next) => {
            if (req.method === 'GET') {
                if (req.url === '/_config') {
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

function setupTunnel(app) {
    const server = serve(app).listen(0);
    const { port } = server.address();
    const lrServer = livereload.createServer();
    return Promise.all([
        localtunnel(port),
        localtunnel(35729),
    ])
        .then(([tunnel, lrTunnel]) => {
            lrServer.watch(app);
            return {
                tunnel,
                lrTunnel,
                stop() {
                    tunnel.stop();
                    server.close();
                    lrServer.close();
                },
            };
        });
}

module.exports = (opts, commandOpts) => {
    return Promise.all([
        setupTunnel(opts.app),
        project.getProject({
            ...opts,
            cacheId: 'android',
            platforms: androidPlatform.platforms,
            plugins: androidPlatform.plugins,
            hooks: androidPlatform.hooks,
        }, commandOpts),
    ])
        .then(([server, projectPath]) => {
            const wwwPath = path.join(projectPath, 'www');
            // Bundle the cordova shell and provided app into the www directory
            return Bundler.bundle(
                require.resolve('@kano/kit-app-shell-cordova/www/index.html'),
                require.resolve('@kano/kit-app-shell-cordova/www/index.js'),
                path.join(__dirname, '../www/run.js'),
                opts.config,
                {
                    appJs: {
                        replaces: {
                            TUNNEL_URL: `'${server.tunnel.url}'`,
                            LR_TUNNEL_URL: `'${server.lrTunnel.url}'`,
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
                .then(() => cordova.run(['android']))
                .then(() => processState.setSuccess('Dev app started'))
                .then(() => projectPath)
                .catch((e) => {
                    server.close();
                    throw e;
                });
        });
};
