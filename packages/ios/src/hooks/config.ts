import { CordovaConfig } from '@kano/kit-app-shell-cordova/lib/cordova-config';
import * as path from 'path';
import * as fs from 'fs';
import chalk from 'chalk';

export = (context) => {
    const { projectRoot, shell } = context.opts;
    // No shell means it's running more than once
    if (!shell) {
        return null;
    }
    const cfg = new CordovaConfig(path.join(projectRoot, 'config.xml'));
    cfg.selectPlatform('ios');

    if (shell.config.APP_DESCRIPTION) {
        cfg.setDescription(shell.config.APP_DESCRIPTION);
    }
    if (shell.config.UI_VERSION) {
        cfg.setVersion(shell.config.UI_VERSION);
        if (shell.config.BUILD_NUMBER) {
            cfg.setIOSBundleVersion(shell.config.BUILD_NUMBER);
        }
    }

    const scheme = shell.opts.preferences.Scheme;

    cfg.addRawXML(`
<config-file parent="ITSAppUsesNonExemptEncryption" target="*-Info.plist">
    <false />
</config-file>
    `);
    cfg.addRawXML(`
<config-file parent="UIStatusBarHidden" platform="ios" target="*-Info.plist">
    <true />
</config-file>
    `);
    cfg.addRawXML(`
<config-file parent="UIViewControllerBasedStatusBarAppearance" platform="ios" target="*-Info.plist">
    <false />
</config-file>
    `);

    cfg.addAllowNavigation(`${scheme}://*`);

    cfg.setElement('content', '', {
        src: `${scheme}:///index.html`,
    });

    const { opts } = shell;

    // TODO: merge using a error util
    if (!opts.developmentTeam) {
        throw new Error(`Could not build iOS app: Missing 'developmentTeam' key in config. Run ${chalk.cyan('kash configure ios')} to fix this`);
    }
    if (!opts.codeSignIdentity) {
        throw new Error(`Could not build iOS app: Missing 'codeSignIdentity' key in config. Run ${chalk.cyan('kash configure ios')} to fix this`);
    }

    const { developmentTeam, codeSignIdentity } = opts;

    // TODO: Integrate more complex debug build vs release build

    fs.writeFileSync(path.join(projectRoot, 'build.json'), JSON.stringify({
        ios: {
            debug: {
                // TODO: See if we can move that to build options
                codeSignIdentity,
                developmentTeam,
                automaticProvisioning: true,
                packageType: 'development',
                buildFlag: [
                    // TODO: Get xcodebuild version and add this dynamicallly
                    '-UseModernBuildSystem=0',
                    '-allowProvisioningUpdates',
                    'SWIFT_VERSION = 3.0',
                    'EMBEDDED_CONTENT_CONTAINS_SWIFT = YES',
                    '-quiet',
                ],
            },
        },
    }));

    return cfg.write();
};
