module.exports = {
    build(yargs) {
        yargs.option('skipAr', {
            type: 'boolean',
            default: 'false',
            describe: 'Export the contents of the debian package instead of the .deb file',
        });
    },
};
