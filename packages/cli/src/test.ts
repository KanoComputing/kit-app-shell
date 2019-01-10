import { loadPlatformKey, GetBuilder } from '@kano/kit-app-shell-core/lib/util/platform';
import { test } from '@kano/kit-app-shell-core/lib/test';
import { agregateArgv, addConfig } from './argv';
import { Argv } from './options';

export default function runTest(argv : Argv, platformId : string, command : string) : Promise<any> {
    // Load the builder from the platform
    return loadPlatformKey(platformId, 'test/get-builder')
        .then((getBuilder : GetBuilder) => {
            return agregateArgv(argv, platformId, command)
                .then(opts => addConfig(opts))
                .then(opts => test({ getBuilder }, opts));
        });
};
