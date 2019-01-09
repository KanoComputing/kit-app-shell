import { loadPlatformKey, GetBuilder } from '@kano/kit-app-shell-core/lib/util/platform';
import { test } from '@kano/kit-app-shell-core/lib/test';
import { agregateArgv, addConfig } from './argv';

export default function runTest(argv, platformId, command) {
    // Load the builder from the platform
    return loadPlatformKey(platformId, 'test/get-builder')
        .then((getBuilder : GetBuilder) => {
            return agregateArgv(argv, platformId, command)
                .then(opts => addConfig(opts))
                .then(opts => test({ getBuilder }, opts));
        });
};
