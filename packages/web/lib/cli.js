module.exports = {
    run(yargs) {
        yargs.option('port', {
            alias: 'p',
            default: 4000,
        });
    },
};
