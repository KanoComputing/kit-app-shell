export default {
    build(sywac) {
        sywac.option('--skip-installer [skipInstaller]', {
            aliases: ['skip-installer', 'skipInstaller'],
            type: 'boolean',
            defaultValue: false,
            desc: 'Generate a windows app without installer',
        });
    }
};
