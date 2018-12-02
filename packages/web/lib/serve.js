const path = require('path');
const connect = require('connect');
const serveStatic = require('serve-static');
const history = require('connect-history-api-fallback');
const cors = require('cors');

const namedResolutionMiddleware = require('@kano/es6-server/named-resolution-middleware');

module.exports = (root, config = {}) => {
    return connect()
        .use((req, res, next) => {
            if (req.method === 'GET') {
                if (req.url === '/_config') {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    config.APP_SRC = './www/index.js';
                    return res.end(JSON.stringify(config));
                }
            }
            next();
        })
        .use(cors())
        .use(history())
        .use('/www', namedResolutionMiddleware({ root }))
        .use(serveStatic(path.join(__dirname, '../www')), { fallthrough: true })
        .use('/www', serveStatic(root));
};
