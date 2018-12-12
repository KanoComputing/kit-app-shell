const { run, getBuilder } = require('@kano/kit-app-shell-electron');
const build = require('./lib/build');

module.exports = {
    cli() {},
    run,
    build,
    getBuilder,
};
