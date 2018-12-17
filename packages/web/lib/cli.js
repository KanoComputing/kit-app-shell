module.exports = {
    group: 'Web: ',
    run(sywac) {
        sywac.number('--port, -p', {
            defaultValue: 4000,
        });
    },
};
