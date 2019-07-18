import * as connect from 'connect';
import * as serveStatic from 'serve-static';
import * as history from 'connect-history-api-fallback';
import * as cors from 'cors';
import * as namedResolutionMiddleware from '@kano/es6-server/named-resolution-middleware';
import { IRunOptions } from '@kano/kit-app-shell-core/lib/types';
import { IReplaceOptions } from '@kano/kit-app-shell-core/lib/plugins/replace';

export type IWebRunOptions = IRunOptions & {
    replaces? : IReplaceOptions[];
};

export interface IServerReplacement {
    test : RegExp;
    from : string;
    to : string;
}

function escapeRegExp(s : string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

export const serve = (root, shellRoot, opts : IWebRunOptions) => {
    const { config, replaces = [] } = opts;
    const serverReplacements = replaces.reduce((accumulator, o) => {
        const include = Array.isArray(o.include) ? o.include : [];
        const all = include.reduce((acc, src) => {
            const values : IServerReplacement[] = Object.keys(o.values)
                .map((from) => {
                    return {
                        test: new RegExp(escapeRegExp(src.replace(/\\/g, '/'))),
                        from,
                        to: o.values[from],
                    };
                });
            return acc.concat(values);
        }, [] as IServerReplacement[]);
        return accumulator.concat(all);
    }, [] as IServerReplacement[]);
    return connect()
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
        .use('/www', namedResolutionMiddleware({ root, replacements: serverReplacements }))
        .use(serveStatic(shellRoot))
        .use('/www', serveStatic(root));
};
