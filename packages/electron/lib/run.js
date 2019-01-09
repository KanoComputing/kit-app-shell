"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("@kano/kit-app-shell-core/lib/util/fs");
const process_state_1 = require("@kano/kit-app-shell-core/lib/process-state");
const child_process_1 = require("child_process");
const electronPath = require("electron/index");
const livereload = require("livereload");
const path = require("path");
const fs = require("fs");
const os = require("os");
function run({ app, config = {}, tmpdir = os.tmpdir() }) {
    process_state_1.processState.setStep('Launching electron app');
    const server = livereload.createServer();
    const configPath = path.join(tmpdir, '.kash-electron.config.json');
    fs.writeFileSync(configPath, JSON.stringify(config));
    const runTplPath = path.join(__dirname, '../data/run.tpl');
    const runPath = path.join(tmpdir, '.kash-electron.run.js');
    server.watch(app);
    return fs_1.fromTemplate(runTplPath, runPath, { LR_URL: 'http://localhost:35729' })
        .then(() => {
        const p = child_process_1.spawn(electronPath, [
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
        process_state_1.processState.setSuccess('Electron app launched');
    })
        .then(() => new Promise(() => { }))
        .catch((e) => {
        server.close();
        throw e;
    });
}
exports.default = run;
//# sourceMappingURL=run.js.map