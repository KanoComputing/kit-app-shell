import { ChannelServer } from '@kano/web-bus/esm/server.js';
import { subscribeDOM, dispose } from '@kano/common/index.js';

function createIAB(src) {
    const w = document.createElement('iframe');
    w.style.width = '100vw';
    w.style.height = '100vh';
    w.style.top = '0';
    w.style.left = '0';
    w.style.border = '0';
    w.style.position = 'absolute';
    w.style.transition = 'opacity 333ms linear';
    w.style.opacity = 0;
    document.body.appendChild(w);
    w.setAttribute('src', src);
    window.iabIFrame = w;
    w.addEventListener('load', () => {
        w.style.opacity = 1;
    });
    return w;
}

function removeIAB() {
    if (window.iabIFrame) {
        window.iabIFrame.remove();
    }
}

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
            this.currentWindow = createIAB(src);
            subscribeDOM(window, 'message', params => this.emit(3, params.data), this, this.subscriptions);
            subscribeDOM(this.currentWindow, 'load', () => resolve(), this, this.subscriptions);
            subscribeDOM(this.currentWindow, 'error', () => reject(new Error('Could not create IAB: IFrame errored during load')), this, this.subscriptions);
        });
    }
    postMessage(message) {
        if (!this.currentWindow) {
            return Promise.reject(new Error('Could not post message: Window does not exists'));
        }
        this.currentWindow.contentWindow.postMessage(message, '*');
        return Promise.resolve();
    }
    close() {
        if (!this.currentWindow) {
            return Promise.reject(new Error('Could not close window: Window is not opened'));
        }
        dispose(this.subscriptions);
        removeIAB();
        return Promise.resolve();
    }
}
