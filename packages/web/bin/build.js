const path = require('path');
const { ConfigLoader } = require('@kano/kit-app-shell-common');
const { build } = require('..');
const { argv } = require('yargs')
    .array('features');
require('colors');

const options = {
    platform: 'OS_PLATFORM',
    platformVersion: 'OS_VERSION',
    features: 'FEATURES',
    profile: 'PROFILE',
    env: 'ENV',
};

const root = path.resolve(argv.root);
const out = path.resolve(argv.out);

const config = ConfigLoader.load(root);

Object.keys(options).forEach((option) => {
    if (argv[option]) {
        config[options[option]] = argv[option];
    }
});

build(root, config, out);
