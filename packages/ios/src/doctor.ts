import { IDoctor } from '@kano/kit-app-shell-core/lib/types';
import { ICheck, ICheckResult, CheckResultSatus } from '@kano/kit-app-shell-core/lib/check';
import * as requirements from 'cordova-ios/bin/templates/scripts/cordova/lib/check_reqs';

type IFormatter = (result : any) => string;

const CordovaIosCheckProvider = (title : string, method : string, formatter? : IFormatter) => {
    return {
        children: [],
        run() {
            return requirements[method]()
                .then((r) => {
                    const result : ICheckResult = {
                        status: CheckResultSatus.Success,
                        title,
                    };
                    if (r.ignore) {
                        result.status = CheckResultSatus.Warning;
                        result.message = r.ignoreMessage;
                    } else if (formatter) {
                        result.message = formatter(r);
                    }
                    return Promise.resolve(result);
                })
                .catch((e) => {
                    const result : ICheckResult = {
                        status: CheckResultSatus.Failure,
                        title,
                        message: e.message || e,
                    };
                    return result;
                });
        },
    } as ICheck;
};

const doctor : IDoctor = {
    checks: [
        CordovaIosCheckProvider('Apple macOS', 'check_os', (v) => v as string),
        CordovaIosCheckProvider('Xcode', 'check_xcodebuild', (r) => r.version),
        CordovaIosCheckProvider('ios-deploy', 'check_ios_deploy', (r) => r.version),
        CordovaIosCheckProvider('CocoaPods', 'check_cocoapods', (r) => r.version),
    ],
};

export default doctor;
