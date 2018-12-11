require('./lib/frozenenv');
const parseArgs = require('minimist');
const path = require('path');

const App = require('./lib/app');

const argsToIgnore = process.defaultApp ? 2 : 1;

// Get necessary opts from cmdline or embedded config
const args = parseArgs(process.argv.slice(argsToIgnore));

const { app, config, preload } = args;

// Store optional preload script in global
// The app's preload script will load this provided file
// Use to inject scripts when runing the app in development
global.preload = preload;

const defaultApp = path.join(__dirname, 'www');
const defaultConfig = path.join(__dirname, 'config.json');

const desktopApp = new App(app || defaultApp, config || defaultConfig, args);

process.on('uncaughtException', function(e) {
    console.error(e);
});
