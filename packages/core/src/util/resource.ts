import * as url from 'url';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as mkdirpCb from 'mkdirp';
import { promisify } from 'util';
import { copy } from './fs';

const mkdirp = promisify(mkdirpCb);

function download(uri : string, dest : string) {
    return mkdirp(path.dirname(dest))
        .then(() => {
            return new Promise((resolve, reject) => {
                const file = fs.createWriteStream(dest);
                const parsed = url.parse(uri);
                const protocol = parsed.protocol.startsWith('https') ? https : http;
                protocol.get(uri, (res) => {
                    res.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        resolve();
                    });
                }).on('error', (err) => {
                    fs.unlinkSync(dest);
                    reject(err);
                });
            });
        });
}

export function getPathOrDownload(urlOrPath : string, tmpPath : string) {
    const parsed = url.parse(urlOrPath);
    if (!parsed.protocol || ['http:', 'https:'].indexOf(parsed.protocol) === -1) {
        return Promise.resolve(urlOrPath);
    }
    const dest = path.join(tmpPath, parsed.pathname);
    return download(urlOrPath, dest)
        .then(() => dest);
}

export type IResources = Array<string | { src : string, dest : string }>;

export function copyResources(resources : IResources, dest : string, basePath : string) {
    const tasks = resources.map((res) => {
        let relativeSrc;
        let relativeDest;

        if (typeof res === 'string') {
            relativeSrc = res;
            relativeDest = res;
        } else {
            relativeSrc = res.src;
            relativeDest = res.dest;
        }
        return copy(path.join(basePath, relativeSrc), path.join(dest, relativeDest));
    });
    return Promise.all(tasks);
}