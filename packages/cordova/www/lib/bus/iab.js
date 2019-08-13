import { ChannelServer } from '@kano/web-bus/esm/server.js';
import { subscribeDOM, dispose } from '@kano/common/index.js';

export class IABServer extends ChannelServer {
    constructor(bus) {
        super(bus, 2346);

        this.subscriptions = [];

        this.currentWindow = null;

        this.listen(0, req => this.openWindow(req.params[0]));
        this.listen(1, req => this.postMessage(req.params[0]));
        this.listen(2, () => this.close());
    }
    openWindow(src) {
        return new Promise((resolve, reject) => {
            this.currentWindow = cordova.InAppBrowser.open(src, '_blank', 'location=no,toolbar=no');
            subscribeDOM(this.currentWindow, 'message', params => this.emit(3, params.data), this, this.subscriptions);
            subscribeDOM(this.currentWindow, 'loadstop', () => resolve(), this, this.subscriptions);
            subscribeDOM(this.currentWindow, 'loaderror', params => reject(new Error(params.message)), this, this.subscriptions);
        });
    }
    postMessage(message) {
        if (!this.currentWindow) {
            return Promise.reject(new Error('Could not post message: Window does not exists'));
        }
        return new Promise((resolve) => {
            this.currentWindow.executeScript({
                code: `window.postMessage(JSON.parse('${JSON.stringify(message)}'), '*')`,
            });
            resolve();
        });
    }
    close() {
        if (!this.currentWindow) {
            return Promise.reject(new Error('Could not close window: Window is not opened'));
        }
        dispose(this.subscriptions);
        this.currentWindow.close();
        return Promise.resolve();
    }
}
