const { ChannelServer } = require('@kano/web-bus/cjs/server');
const { ipcMain } = require('electron');

class IABServer extends ChannelServer {
    constructor(bus, window) {
        super(bus, 2346);
        this.window = window;

        this.currentCallback = null;

        this.listen(0, req => this.openWindow(req.params[0]));
        this.listen(1, req => this.postMessage(req.params[0]));
        this.listen(2, () => this.close());
        ipcMain.on('iab-message', (e, arg) => {
            if (e.sender === this.window.webContents) {
                this.emit(3, arg);
            }
        });
    }
    openWindow(src) {
        return new Promise((resolve, reject) => {
            const callback = (e) => {
                if (e.sender === this.window.webContents) {
                    ipcMain.removeListener('iab-load', callback);
                    resolve();
                }
            };
            ipcMain.on('iab-load', callback);
            this.window.webContents.send('open-iab', src);
        });
    }
    postMessage(message) {
        this.window.webContents.send('iab-message', message);
        return Promise.resolve();
    }
    close() {
        this.window.webContents.send('close-iab');
        return Promise.resolve();
    }
}

module.exports = (bus, window) => {
    const s = new IABServer(bus, window);
};
