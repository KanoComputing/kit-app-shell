const { ChannelServer } = require('@kano/web-bus/cjs/server');
const { ipcMain } = require('electron');

class AuthServer extends ChannelServer {
    constructor(bus, window) {
        super(bus, 2345);

        this.window = window;

        this.listen(0, (req) => {
            return this.requestSignup(req.params[0]);
        });
    }
    requestSignup(src) {
        return new Promise((resolve) => {
            this.window.webContents.send('open-iab', src);
            const callback = (e, arg) => {
                if (e.sender === this.window.webContents) {
                    ipcMain.removeListener('auth-token-callback', callback);
                    resolve(arg);
                }
            }
            ipcMain.on('auth-token-callback', callback);
            const quitCallback = (e) => {
                if (e.sender === this.window.webContents) {
                    ipcMain.removeListener('quit', quitCallback);
                    this.window.webContents.send('close-iab');
                }
            }
            ipcMain.on('quit', quitCallback);
        });
    }
}

module.exports = (bus, window) => {
    const s = new AuthServer(bus, window);
};
