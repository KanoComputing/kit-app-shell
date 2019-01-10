import { spawn } from 'child_process';

export function id() : Promise<Array<string>> {
    return new Promise((resolve, reject) => {
        const p = spawn('idevice_id', ['-l']);

        let output = '';
        let error = '';

        p.stdout.on('data', (chunk) => {
            output += chunk.toString();
        });

        p.stderr.on('data', (chunk) => {
            error += chunk.toString();
        });
        p.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`Could not run idevice_id: ${error}`));
            }
            return resolve(output.split('\n').filter(i => i && i !== ''));
        });
    });
}
