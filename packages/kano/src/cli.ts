export default {
    group: 'KanoOS:',
    build(sywac) {
        sywac.boolean('--skip-ar', {
            defaultValue: false,
            desc: 'Export the contents of the debian package instead of the .deb file',
        });
    },
};
