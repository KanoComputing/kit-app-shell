const { processState } = require('@kano/kit-app-shell-core/lib/process-state');
const serve = require('./serve');
const chalk = require('chalk');

module.exports = function run({ app, config = {} } = {}, { port = 8000 } = {}) {
    const server = serve(app, config).listen(port);

    const address = server.address();

    processState.setInfo(`Serving ${chalk.blue(app)} at ${chalk.green(`http://localhost:${address.port}`)}`);

    // Never resolves, to let the CLI hang while the server runs
    return new Promise(() => {});
};
