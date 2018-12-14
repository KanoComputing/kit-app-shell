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
        Scheme: 'sample-app',
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

    const scheme = 'sample-app';

    xml.addRaw(platformEl, `
<allow-navigation href="${scheme}://*/*"/>
    `);
    xml.addRaw(platformEl, `
<allow-intent href="${scheme}://*/*"/>
    `);

    xml.setElement(cfg._doc._root, 'content', 'content', '', {
        src: `${scheme}:///index.html`,
    });

    const { commandOpts } = shell;

    // TODO: merge using a error util
    if (!commandOpts.developmentTeam) {
        throw new Error(`Could not build iOS app: Missing 'developmentTeam' key in config. Make sure you have a .kashrc.json file in your home directory`);
    }
    if (!commandOpts.codeSignIdentity) {
        throw new Error(`Could not build iOS app: Missing 'codeSignIdentity' key in config. Make sure you have a .kashrc.json file in your home directory`);
    }

    const { developmentTeam, codeSignIdentity } = commandOpts;

    // TODO: Integrate more complex debug build vs release build

    fs.writeFileSync(path.join(projectRoot, 'build.json'), JSON.stringify({
        ios: {
            debug: {
                codeSignIdentity,
                developmentTeam,
                automaticProvisioning: true,
                packageType: 'development',
                buildFlag: [
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
