const build = require('./lib/build');
const cli = require('./lib/cli');
const run = require('./lib/run');
const configure = require('./lib/configure');
const getBuilder = require('./lib/test/get-builder');

module.exports = {
    cli,
    run,
    build,
    getBuilder,
    configure,
};
