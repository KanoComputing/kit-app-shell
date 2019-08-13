import { Channel } from '@kano/web-bus/esm/bus.js';

export class IAB {
    constructor(bus) {
        this.channel = new Channel(bus, 2346);
    }
    openWindow(src) {
        return this.channel.sendRequest(0, 10000, src)
            .then(() => {
                return this;
            });
    }
    postMessage(message) {
        return this.channel.sendRequest(1, 3000, message);
    }
    close() {
        return this.channel.sendRequest(2, 3000);
    }
    onDidReceiveMessage(callback) {
        return this.channel.addListener(3, callback);
    }
}
