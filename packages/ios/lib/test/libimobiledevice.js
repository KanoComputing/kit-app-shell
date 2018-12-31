const { spawn } = require('child_process');

function id() {
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
            if (parseInt(code, 10) !== 0) {
                return reject(new Error(`Could not run idevice_id: ${error}`));
            }
            return resolve(output.split('\n').filter(i => i && i !== ''));
        });
    });
}

module.exports = {
    id,
};
