const cli = require('./lib/cli');
const run = require('./lib/run');
const build = require('./lib/build');
const getBuilder = require('./lib/test/get-builder');

module.exports = {
    cli,
    run,
    build,
    getBuilder,
};
