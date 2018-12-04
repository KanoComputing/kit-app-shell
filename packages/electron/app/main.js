require('./lib/frozenenv');
const parseArgs = require('minimist');
const path = require('path');

const App = require('./lib/app');

const argsToIgnore = process.defaultApp ? 2 : 1;

// Get necessary opts from cmdline or embedded config
const args = parseArgs(process.argv.slice(argsToIgnore));

const { app, config } = args;

const defaultApp = path.join(__dirname, 'www');
const defaultConfig = path.join(__dirname, 'config.json');

const desktopApp = new App(app || defaultApp, config || defaultConfig, args);

process.on('uncaughtException', function(e) {
    console.error(e);
});
