const { xml } = require('@kano/kit-app-shell-cordova');
const path = require('path');
const Config = require('cordova-config');

const fs = require('fs');

module.exports = (context) => {
    const { projectRoot, shell } = context.opts;
    // No shell means it's running more than once
    if (!shell) {
        return;
    }
    const cfg = new Config(path.join(projectRoot, 'config.xml'));

    if (shell.config.APP_DESCRIPTION) {
        cfg.setDescription(config.APP_DESCRIPTION);
    }
    if (shell.config.UI_VERSION) {
        cfg.setVersion(shell.config.UI_VERSION);
        if (shell.config.BUILD_NUMBER) {
            cfg.setIOSBundleVersion(shell.config.BUILD_NUMBER);
        }
    }

    const platformEl = xml.findInConfig(cfg, 'platform/[@name="ios"]');

    const preferences = {
        Scheme: 'kit-app',
        DisallowOverscroll: true,
        'target-device': 'tablet',
        'deployment-target': '10.0',
    };

    Object.keys(preferences).forEach((preference) => {
        xml.addElement(cfg._doc._root, 'preference', '', {
            name: preference,
            value: preferences[preference],
        });
    });

    xml.addRaw(platformEl, `
<config-file parent="ITSAppUsesNonExemptEncryption" target="*-Info.plist">
    <false />
</config-file>
    `);
    xml.addRaw(platformEl, `
<config-file parent="UIStatusBarHidden" platform="ios" target="*-Info.plist">
    <true />
</config-file>
    `);
    xml.addRaw(platformEl, `
<config-file parent="UIViewControllerBasedStatusBarAppearance" platform="ios" target="*-Info.plist">
    <false />
</config-file>
    `);

    xml.addRaw(platformEl, `<allow-navigation href="kit-app://*"></allow-navigation>`);


    const scheme = 'kit-app';

    xml.setElement(cfg._doc._root, 'content', 'content', '', {
        src: `${scheme}:///index.html`,
    });

    const { opts } = shell;

    // TODO: merge using a error util
    if (!opts.developmentTeam) {
        throw new Error(`Could not build iOS app: Missing 'developmentTeam' key in config. Make sure you have a .kashrc.json file in your home directory`);
    }
    if (!opts.codeSignIdentity) {
        throw new Error(`Could not build iOS app: Missing 'codeSignIdentity' key in config. Make sure you have a .kashrc.json file in your home directory`);
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
                ]
            }
        }
    }));

    return cfg.write();
};
