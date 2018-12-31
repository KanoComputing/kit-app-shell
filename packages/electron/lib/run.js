const util = require('@kano/kit-app-shell-core/lib/util');
const processState = require('@kano/kit-app-shell-core/lib/process-state');
const { spawn } = require('child_process');
const electronPath = require('electron');
const livereload = require('livereload');
const path = require('path');
const fs = require('fs');
const os = require('os');

function run({ app, config = {} }) {
    processState.setStep('Launching electron app');
    const server = livereload.createServer();
    // Write a temp file with the aggregated config
    const configPath = path.join(os.tmpdir(), '.kash-electron.config.json');
    fs.writeFileSync(configPath, JSON.stringify(config));

    const runTplPath = path.join(__dirname, '../data/run.tpl');
    const runPath = path.join(os.tmpdir(), '.kash-electron.run.js');

    server.watch(app);

    return util.fs.fromTemplate(runTplPath, runPath, { LR_URL: 'http://localhost:35729' })
        .then(() => {
            // Start the electron for the app provided with the config provided
            const p = spawn(electronPath, [
                '.',
                '--ui', app,
                '--config', configPath,
                '--preload', runPath,
            ], { cwd: path.join(__dirname, '../app'), _showOutput: true });

            p.stdout.pipe(process.stdout);
            p.stderr.pipe(process.stderr);

            p.on('close', () => {
                server.close();
            });

            processState.setSuccess('Electron app launched');
        })
        .catch((e) => {
            server.close();
            throw e;
        });
}

module.exports = run;
