const path = require('path');
const { serve } = require('..');
const { ConfigLoader } = require('@kano/kit-app-shell-common');
const { argv } = require('yargs')
    .array('features');
require('colors');

const options = {
    platform: 'OS_PLATFORM',
    platformVersion: 'OS_VERSION',
    features: 'FEATURES',
    profile: 'PROFILE',
    env: 'ENV',
    entry: 'ENTRY',
};

const root = path.resolve(argv.root);

const config = ConfigLoader.load(root);

Object.keys(options).forEach((option) => {
    if (argv[option]) {
        config[options[option]] = argv[option];
    }
});


const server = serve(root, config).listen(8000);

const { port } = server.address();

console.log(`Serving ${root.blue} at ${`http://localhost:${port}`.green}`);
