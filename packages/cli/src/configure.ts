import { prompt } from 'enquirer';
import * as deepMerge from 'deepmerge';
// Individual require will load way less than using the whole library
import { util } from '@kano/kit-app-shell-core/lib/util';
import { RcLoader } from '@kano/kit-app-shell-core/lib/rc';
import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import chalk from 'chalk';
import { Argv } from './types';

export default function configure(argv : Argv, platformId : string) : Promise<void> {
    processState.setInfo(`Configuring options for platform ${chalk.green(platformId)}`);
    return util.platform.loadPlatformKey(platformId, 'configure')
        .then((platformConfigure) => {
            // Load the current user configs
            return RcLoader.loadHomeRc()
                .then((cfg) => {
                    // No prompts dfined for this platform
                    if (typeof platformConfigure.enquire !== 'function') {
                        processState.setInfo(`Platform '${platformId}' does not require any configuration`);
                        return null;
                    }
                    // Let the platform ask the user questions
                    return platformConfigure.enquire(prompt, cfg[platformId] || {})
                        .then((answers) => {
                            // Generate let the platform modify the answers before saving them
                            // Ignore if not defined by the platform
                            // TODO: Change name, generate is not cool
                            if (typeof platformConfigure.generate !== 'function') {
                                return answers;
                            }
                            return platformConfigure.generate(answers);
                        })
                        .then((answers) => {
                            // Wrap the answers in an object under the platform id as key
                            // This scopes each platform's config to avoid any overlap
                            const scopedAnswers = {
                                [platformId]: answers || {},
                            };
                            // Merge the current config with the user's answers
                            // TODO: decide what to do with arrrays, deepmerge concatenate them by default,
                            // this might not be the desired behavior
                            return deepMerge(cfg, scopedAnswers);
                        })
                        // Persist the new config
                        .then(updatedCfg => RcLoader.saveHomeRc(updatedCfg))
                        .then(() => {
                            processState.setSuccess(`Your local config has been updated. Use ${chalk.cyan('kash open config')} to see it`);
                        });
                });
        });
};
