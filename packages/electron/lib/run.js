
const { ConfigLoader } = require('@kano/kit-app-shell-common');
const { spawn } = require('child_process');
const electronPath = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');


function run({ app }, {}, platform) {
    if (!platform) {
        throw new Error(`Could not run app: 'electron' is not a valid platform`);
    }

    const config = ConfigLoader.load(app);

    const configPath = path.join(os.tmpdir(), '.kash-electron.config.json');

    fs.writeFileSync(configPath, JSON.stringify(config));

    const p = spawn(electronPath, ['.', '--app', app, '--config', configPath], { cwd: path.join(__dirname, '../app'), _showOutput: true });

    p.stdout.pipe(process.stdout);
    p.stderr.pipe(process.stderr);
}

module.exports = run;
