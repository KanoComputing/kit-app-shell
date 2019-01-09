"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
class ElectronChromedriver {
    start(port) {
        let command;
        try {
            command = require.resolve('electron-chromedriver/bin/chromedriver');
        }
        catch (e) {
            command = require.resolve('electron-chromedriver/bin/chromedriver.exe');
        }
        this.process = child_process_1.spawn(command, ['--url-base=wd/hub', `--port=${port}`]);
        this.process.on('close', () => { });
        this.process.on('error', (error) => {
            throw error;
        });
    }
    stop() {
        if (!this.process) {
            return;
        }
        this.process.kill();
    }
}
exports.ElectronChromedriver = ElectronChromedriver;
//# sourceMappingURL=electron-chromedriver.js.map