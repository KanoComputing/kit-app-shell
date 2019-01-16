import * as path from 'path';
import * as connect from 'connect';
import * as serveStatic from 'serve-static';
import * as history from 'connect-history-api-fallback';
import * as cors from 'cors';
import * as namedResolutionMiddleware from '@kano/es6-server/named-resolution-middleware';

export const serve = (root, config : any = {}) => connect()
    .use((req, res, next) => {
        if (req.method === 'GET') {
            if (req.url === '/_config') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                config.APP_SRC = './www/index.js';
                return res.end(JSON.stringify(config));
            }
        }
        return next();
    })
    .use(cors())
    .use(history())
    .use('/www', namedResolutionMiddleware({ root }))
    .use(serveStatic(path.join(__dirname, '../www')))
    .use('/www', serveStatic(root));
