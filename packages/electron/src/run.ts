import { fromTemplate } from '@kano/kit-app-shell-core/lib/util/fs';
import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import { spawn } from 'child_process';
import electronPath = require('electron/index');
import * as livereload from 'livereload';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { IRun, IRunOptions } from '@kano/kit-app-shell-core/lib/types';
import { prepareApp } from './prepare';

const electronRun : IRun = ({ app, config, tmpdir = os.tmpdir() } : IRunOptions) => {
    processState.setStep('Launching electron app');
    const server = livereload.createServer();
    // Write a temp file with the aggregated config
    const configPath = path.join(tmpdir, '.kash-electron.config.json');
    fs.writeFileSync(configPath, JSON.stringify(config));

    const runTplPath = path.join(__dirname, '../data/run.tpl');
    const runPath = path.join(tmpdir, '.kash-electron.run.js');

    server.watch(app);

    // Move the apis from core into the app folder. This directory won't be versioned
    return prepareApp(path.join(__dirname, '../app'), config)
        .then(() => fromTemplate(runTplPath, runPath, { LR_URL: 'http://localhost:35729' }))
        .then(() => {
            // Start the electron for the app provided with the config provided
            const p = spawn(electronPath, [
                '.',
                '--ui', app,
                '--config', configPath,
                '--preload', runPath,
            // @ts-ignore
            ], { cwd: path.join(__dirname, '../app'), _showOutput: true });

            p.stdout.pipe(process.stdout);
            p.stderr.pipe(process.stderr);

            p.on('close', () => {
                server.close();
            });

            processState.setSuccess('Electron app launched');
        })
        .then(() => new Promise(() => null))
        .catch((e) => {
            server.close();
            throw e;
        });
};

export default electronRun;
