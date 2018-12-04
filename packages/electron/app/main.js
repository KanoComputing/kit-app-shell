require('./lib/frozenenv');
const parseArgs = require('minimist');

const App = require('./lib/app');

const argsToIgnore = process.defaultApp ? 2 : 1;

// Get necessary opts from cmdline or embedded config
const args = parseArgs(process.argv.slice(argsToIgnore));

const { app, config } = args;

const desktopApp = new App(app, config, args);

process.on('uncaughtException', function(e) {
    console.error(e);
});
