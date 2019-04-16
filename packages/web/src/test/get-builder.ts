import getBuilder from '@kano/kit-app-shell-cordova/lib/test/get-builder';
import { IBuilderFactory, Builder } from '@kano/kit-app-shell-core/lib/types';

/**
 * Create a builder to create a driver for each test
 */
const getWebBuilder : IBuilderFactory = (wd, mocha, opts) : Promise<Builder> => {
    // Remote device providers are configured in the test platform
    // and Android
    return getBuilder(wd, mocha, opts)
        .then((builder) => {
            if (!builder) {
                throw new Error(`Could not run tests: '${opts.provider}' is not a valid device provider`);
            }
            return builder;
        });
};

export default getWebBuilder;
