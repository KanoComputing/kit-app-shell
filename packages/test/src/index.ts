import { loadPlatformKey } from '@kano/kit-app-shell-core/lib/util/platform';
import { IBuilderFactory, ITestContext } from '@kano/kit-app-shell-core/lib/types';

export function getDriver(platform : string, wd : any, ctx : ITestContext, opts) {
    return loadPlatformKey(platform, 'test/get-builder')
        .then((getBuilder : IBuilderFactory) => {
            return getBuilder(wd, ctx, opts)
                .then((builder) => builder());
        });
}
