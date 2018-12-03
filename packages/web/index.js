const run = require('./lib/run');
const build = require('./lib/build');

module.exports = {
    run,
    build,
    config(y) {
        console.log(y.option('profile').argv);
    }
};
