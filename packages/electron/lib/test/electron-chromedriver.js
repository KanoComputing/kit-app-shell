const { spawn } = require('child_process');

// TODO: TESTS!!!!
class ElectronChromedriver {
    start() {
        let command;
        // Try to find the chrome driver for all platforms
        try {
            command = require.resolve('electron-chromedriver/bin/chromedriver');
        } catch (e) {
            command = require.resolve('electron-chromedriver/bin/chromedriver.exe');
        }
    
        // TODO: Subprocess managment
        this._process = spawn(command, []);
        this._process.on('close', (code) => {});
        this._process.on('error', (error) => { throw new Error(error) })
    }
    stop() {
        if (!this._process) {
            return;
        }
        this._process.kill();
    }
}

module.exports = ElectronChromedriver;
