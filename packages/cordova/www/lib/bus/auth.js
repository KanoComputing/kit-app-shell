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
