import * as connect from 'connect';
import * as serveStatic from 'serve-static';
import * as history from 'connect-history-api-fallback';
import * as cors from 'cors';

export const serve = (root) => connect()
    .use(cors())
    .use(history())
    .use(serveStatic(root));
