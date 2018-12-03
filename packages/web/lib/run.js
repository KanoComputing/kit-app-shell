const serve = require('./serve');
require('colors');

module.exports = function run({ app, config = {} } = {}) {
    const server = serve(app, config).listen(8000);

    const { port } = server.address();

    console.log(`Serving ${app.blue} at ${`http://localhost:${port}`.green}`);
};
