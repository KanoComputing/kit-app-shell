
const { ConfigLoader } = require('@kano/kit-app-shell-common');
const { spawn } = require('child_process');
const electronPath = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');


function run({ app }, {}) {
    const config = ConfigLoader.load(app);

    // Write a temp file with the aggregated config
    const configPath = path.join(os.tmpdir(), '.kash-electron.config.json');
    fs.writeFileSync(configPath, JSON.stringify(config));

    // Start the electron for the app provided with the config provided 
    const p = spawn(electronPath, ['.', '--app', app, '--config', configPath], { cwd: path.join(__dirname, '../app'), _showOutput: true });

    p.stdout.pipe(process.stdout);
    p.stderr.pipe(process.stderr);
}

module.exports = run;
