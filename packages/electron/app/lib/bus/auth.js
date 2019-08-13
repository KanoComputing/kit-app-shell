const { ChannelServer } = require('@kano/web-bus/cjs/server');
class AuthServer extends ChannelServer {
    constructor(bus, window) {
        super(bus, 2345);

        this.listen(0, () => Promise.reject(new Error('Auth API was deprecated, use the IAB API')));
    }
}

module.exports = (bus, window) => {
    const s = new AuthServer(bus, window);
};
