const run = require('./lib/run');
const cli = require('./lib/cli');
const build = require('./lib/build');
const util = require('./lib/util');
const project = require('./lib/project');
const CordovaConfig = require('./lib/cordova-config');

module.exports = {
    cli,
    run,
    build,
    util,
    project,
    CordovaConfig,
};
