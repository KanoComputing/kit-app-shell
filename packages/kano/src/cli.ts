import { ICli } from '@kano/kit-app-shell-core/lib/types';

const kanoCli : ICli = {
    group: 'KanoOS:',
    build(sywac) {
        sywac.boolean('--skip-ar', {
            defaultValue: false,
            desc: 'Export the contents of the debian package instead of the .deb file',
        });
    },
};

export default kanoCli;
