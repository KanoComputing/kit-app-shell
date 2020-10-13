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
    const cfg = new CordovaConfig(path.join(projectRoot, 'config.xml')) as any;

    if (shell.config.APP_DESCRIPTION) {
        cfg.setDescription(shell.config.APP_DESCRIPTION);
    }
    if (shell.config.UI_VERSION) {
        cfg.setVersion(shell.config.UI_VERSION);
        if (typeof shell.config.BUILD_NUMBER !== 'undefined') {
            cfg.setIOSBundleVersion(shell.config.BUILD_NUMBER || 1);
        }
    }

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
    cfg.addRawXML(`
<config-file parent="NSBluetoothAlwaysUsageDescription" platform="ios" target="*-Info.plist">
    <string>This app requires access to your bluetooth to allow you to connect with devices included with this product</string>
</config-file>
    `);

    const { opts } = shell;

    // TODO: merge using a error util
    if (!opts.developmentTeam) {
        throw new Error(`Could not build iOS app: Missing 'developmentTeam' key in config. Run ${chalk.cyan('kash configure ios')} to fix this`);
    }
    if (!opts.codeSignIdentity) {
        throw new Error(`Could not build iOS app: Missing 'codeSignIdentity' key in config. Run ${chalk.cyan('kash configure ios')} to fix this`);
    }

    const { developmentTeam, codeSignIdentity, provisioningProfile } = opts;

    const automaticProvisioning = !provisioningProfile;

    const buildFlag = [
        '-UseModernBuildSystem=0',
        '-quiet',
    ];

    if (automaticProvisioning) {
        buildFlag.push('-allowProvisioningUpdates');
    }

    fs.writeFileSync(path.join(projectRoot, 'build.json'), JSON.stringify({
        ios: {
            debug: {
                // TODO: See if we can move that to build options
                codeSignIdentity,
                developmentTeam,
                automaticProvisioning,
                provisioningProfile,
                packageType: 'development',
                buildFlag,
            },
            release: {
                codeSignIdentity,
                developmentTeam,
                automaticProvisioning,
                provisioningProfile,
                packageType: 'app-store',
                buildFlag,
            },
        },
    }));

    return cfg.write();
};
