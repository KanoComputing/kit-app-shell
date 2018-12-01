const { argv, showHelp } = require('yargs');

const [action] = argv._;

switch (action) {
case 'run': {
    require('./run');
    break;
}
case 'build': {
    require('./build');
    break;
}
default: {
    showHelp();
    break;
}
}
