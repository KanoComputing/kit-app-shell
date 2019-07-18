import { ChannelServer } from '@kano/web-bus/esm/server.js';

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

export class AuthServer extends ChannelServer {
    constructor(bus) {
        super(bus, 2345);

        this.listen(0, (req) => {
            return this.requestSignup(req.params[0]);
        });
    }
    requestSignup(src) {
        return new Promise((resolve) => {
            createIAB(src);
            window.addEventListener('message', (e) => {
                switch(e.data.m) {
                    case 'auth-callback':
                        resolve(e.data.a);
                        break;
                    case 'quit':
                        removeIAB();
                        break;
                }
            });
        });
    }
}
