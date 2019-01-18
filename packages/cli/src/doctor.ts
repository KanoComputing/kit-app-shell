import { util } from '@kano/kit-app-shell-core/lib/util';
import { IDoctor } from '@kano/kit-app-shell-core/lib/types';
import { ICheck } from '@kano/kit-app-shell-core/lib/check';

export default function doctor(platformId : string) : Promise<ICheck[]> {
    return util.platform.loadPlatformKey(platformId, 'doctor', true)
        .then((platformDoctor : IDoctor) => {
            if (!platformDoctor || !platformDoctor.checks) {
                return [];
            }
            return platformDoctor.checks;
        });
}
