import { ChannelServer } from '@kano/web-bus/esm/server.js';

export class AuthServer extends ChannelServer {
    constructor(bus) {
        super(bus, 2345);

        this.listen(0, () => {
            return Promise.reject(new Error('THe auth API has been deprecated, use the IAB API'))
        });
    }
}
