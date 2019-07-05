import { ChannelServer } from '@kano/web-bus/esm/server.js';
import { IAPChannelId, IAPMethods } from '@kano/web-bus/esm/apis/iap/definition.js';

const DEFAULT_TIMEOUT = 60000;

export class IAPServer extends ChannelServer {
    constructor(bus) {
        super(bus, IAPChannelId);

        this.listen(IAPMethods.GET_PRODUCTS, DEFAULT_TIMEOUT, (req) => {
            console.log(req);
        });
    }
}
