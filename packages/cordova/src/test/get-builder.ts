
import { loadPlatformKey, GetBuilder } from '@kano/kit-app-shell-core/lib/util/platform';

/**
 * Find the builder matching the provided target device provider
 */
const getBuilder = (wd, mocha, opts) => {
    // If not a local run, try to load the providers from the test module
    // If the user didn't install that module they will be prompted to do so
    if (opts.provider !== 'local') {
        return loadPlatformKey('test', 'get-builder')
            .then((getBuilder : GetBuilder) => {
                return getBuilder(wd, mocha, opts);
            });
    }
    return null;
};

export default getBuilder;
