const { log } = require('@kano/kit-app-shell-core');
const serve = require('./serve');
const chalk = require('chalk');

module.exports = function run({ app, config = {} } = {}, { port = 8000 } = {}) {
    const server = serve(app, config).listen(port);

    const address = server.address();

    log.info(`Serving ${chalk.blue(app)} at ${chalk.green(`http://localhost:${address.port}`)}`);
};
