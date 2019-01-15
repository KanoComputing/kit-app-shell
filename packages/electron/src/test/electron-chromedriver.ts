import { spawn, ChildProcess } from 'child_process';

// TODO: TESTS!!!!
export class ElectronChromedriver {

    private process : ChildProcess;

    start(port) {
        let command;
        // Try to find the chrome driver for all platforms
        try {
            command = require.resolve('electron-chromedriver/bin/chromedriver');
        } catch (e) {
            command = require.resolve('electron-chromedriver/bin/chromedriver.exe');
        }

        // TODO: Subprocess managment
        this.process = spawn(command, ['--url-base=wd/hub', `--port=${port}`]);
        this.process.on('close', () => null);
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
