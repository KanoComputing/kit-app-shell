const getBuilder = require('./lib/test/get-builder');
const build = require('./lib/build');
const run = require('./lib/run');
const cli = require('./lib/cli');

module.exports = {
    cli,
    run,
    build,
    getBuilder,
};
