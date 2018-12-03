const { log } = require('@kano/kit-app-shell-common');
const serve = require('./serve');
require('colors');

module.exports = function run({ app, config = {} } = {}, { port = 8000 } = {}) {
    const server = serve(app, config).listen(port);

    const address = server.address();

    log.info(`Serving ${app.blue} at ${`http://localhost:${address.port}`.green}`);
};
