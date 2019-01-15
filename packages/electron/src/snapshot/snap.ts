import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as mkdirpCb from 'mkdirp';
import { promisify } from 'util';
import { generateSnapshotSource, generateEntryFile } from './link';
import { mksnapshot } from './mksnapshot';
import { bundle } from './bundle';

const mkdirp = promisify(mkdirpCb);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

export function snap(main : string, electron : string, out : string) : Promise<string> {
    const tmpSnapshotDir = path.join(os.tmpdir(), 'snapshot');
    const tmpSnapshotPath = path.join(tmpSnapshotDir, 'snapshot.js');
    return mkdirp(tmpSnapshotDir)
        .then(() => bundle(main))
        .then((bundleSource) => {
            return generateSnapshotSource(
                bundleSource,
                tmpSnapshotPath,
            )
        })
        .then(source => mksnapshot(source, electron))
        .then(() => generateEntryFile(path.join(out, '_main.js')))
        .then(() => {
            const pckPath = path.join(out, 'package.json');
            return readFile(pckPath, 'utf-8')
                .then((content) => {
                    const pck = JSON.parse(content);
                    pck.main = '_main.js';
                    return writeFile(pckPath, JSON.stringify(pck, null, '    '), 'utf-8');
                });
        })
        .then(() => out);
}
