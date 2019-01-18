import { IDoctor } from '@kano/kit-app-shell-core/lib/types';
import { ICheck, ICheckResult, CheckResultSatus } from '@kano/kit-app-shell-core/lib/check';
import * as requirements from 'cordova-android/bin/templates/cordova/lib/check_reqs';

type IFormatter = (result : boolean|string|string[]) => string;

const CordovaAndroidCheckProvider = (title : string, method : string, formatter? : IFormatter) => {
    return {
        children: [],
        run() {
            return requirements[method]()
                .then((r) => {
                    const result : ICheckResult = {
                        status: CheckResultSatus.Success,
                        title,
                    };
                    if (formatter) {
                        result.message = formatter(r);
                    }
                    return Promise.resolve(result);
                })
                .catch((e) => {
                    const result : ICheckResult = {
                        status: CheckResultSatus.Failure,
                        title,
                        message: e.message,
                    };
                    return result;
                });
        },
    } as ICheck;
};

const doctor : IDoctor = {
    checks: [
        CordovaAndroidCheckProvider('Java', 'check_java', (v) => v as string),
        CordovaAndroidCheckProvider('Android', 'check_android'),
        CordovaAndroidCheckProvider('Android target', 'check_android_target', (t) => (t as string[]).join(', ')),
        CordovaAndroidCheckProvider('Gradle', 'check_gradle', (p) => `Installed at ${p}`),
    ],
};

export default doctor;
