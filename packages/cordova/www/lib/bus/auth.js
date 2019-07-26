import { ChannelServer } from '@kano/web-bus/esm/server.js';


export class AuthServer extends ChannelServer {
    constructor(bus) {
        super(bus, 2345);

        this.listen(0, (req) => {
            return this.requestSignup(req.params[0]);
        });
    }
    requestSignup(src) {
        return new Promise((resolve) => {
            const w = cordova.InAppBrowser.open(src, '_blank', 'location=no,toolbar=no');
            w.addEventListener('loadstop', () => {
                // catch a regular event in the opened window and proxy it to the webkit
                // message handlers for ios support
                w.executeScript({ code: `
                    if (webkit && webkit.messageHandlers) {
                        setTimeout(() => {
                            console.log('ios detected lol');
                        }, 5000)
                        window.addEventListener('message', function (e) {
                            webkit.messageHandlers.cordova_iab.postMessage(JSON.stringify(e.data));
                        });
                    }
                ` });
            });
            w.addEventListener('message', (e) => {
                switch(e.data.m) {
                    case 'auth-callback':
                        resolve(e.data.a);
                        break;
                    case 'quit':
                        w.close();
                        break;
                }
            });
        });
    }
}
