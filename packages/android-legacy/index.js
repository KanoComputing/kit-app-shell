const { cli } = require('@kano/kit-app-shell-cordova');
const build = require('./lib/build');
const run = require('./lib/run');

module.exports = {
    cli,
    run,
    build,
};
