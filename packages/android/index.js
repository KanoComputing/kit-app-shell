const cli = require('./lib/cli');
const build = require('./lib/build');
const run = require('./lib/run');
const getBuilder = require('./lib/test/get-builder');

module.exports = {
    cli,
    run,
    build,
    getBuilder,
};
