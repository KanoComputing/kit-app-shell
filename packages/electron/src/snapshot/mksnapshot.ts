import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';

export function mksnapshot(source : string, out : string) {
    return new Promise((resolve, reject) => {
        const packageRoot = path.dirname(require.resolve('electron-mksnapshot/package.json'));
        let p : ChildProcess;
        let binaryName = 'mksnapshot';
        let errBuffer : string;
        if (process.platform === 'win32') {
            binaryName += '.cmd';
        }
        try {
            p = spawn(path.join(packageRoot, `../.bin/${binaryName}`), [
                source,
                '--output_dir',
                out,
            ]);
        } catch (e) {
            return reject(e);
        }

        p.on('error', (e) => {
            return reject(e);
        });

        p.stderr.on('data', (d) => {
            errBuffer += d.toString();
        });

        p.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`Could not run mksnapshot: ${errBuffer}`));
            }
            resolve();
        });
    });
}
