import { spawn } from 'child_process';
import * as path from 'path';

export function mksnapshot(source : string, out : string) {
    return new Promise((resolve, reject) => {
        const packageRoot = path.dirname(require.resolve('electron-mksnapshot/package.json'));
        const p = spawn(path.join(packageRoot, '../.bin/mksnapshot.cmd'), [
            source,
            '--output_dir',
            out,
        ]);

        p.on('close', (code) => {
            if (code !== 0) {
                return reject();
            }
            resolve();
        });
    });
}
