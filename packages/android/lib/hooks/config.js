"use strict";
const path = require("path");
const cordova_config_1 = require("@kano/kit-app-shell-cordova/lib/cordova-config");
function bindNumberAsString(value, length) {
    const str = value.toString().substr(-length);
    return str.padStart(length, '0');
}
module.exports = (context) => {
    const { projectRoot, shell } = context.opts;
    if (!shell) {
        return null;
    }
    const cfg = new cordova_config_1.CordovaConfig(path.join(projectRoot, 'config.xml'));
    if (shell.config.APP_DESCRIPTION) {
        cfg.setDescription(shell.config.APP_DESCRIPTION);
    }
    if (shell.config.UI_VERSION) {
        cfg.setVersion(shell.config.UI_VERSION);
        const [major, minor, patch] = shell.config.UI_VERSION.split('.');
        const buildNumber = shell.config.BUILD_NUMBER || 0;
        const parts = [
            bindNumberAsString(major, 2),
            bindNumberAsString(minor, 2),
            bindNumberAsString(patch, 2),
            bindNumberAsString(buildNumber, 3),
        ];
        if (shell.config.BUILD_NUMBER) {
            cfg.setAndroidVersionCode(`1${parts.join('')}`);
        }
    }
    cfg.setElement('content', '', {
        src: 'http://localhost:8080/index.html',
    });
    const { supportsScreens } = shell.opts;
    if (typeof supportsScreens === 'object') {
        cfg.setWidgetAttribute('xmlns:android', 'http://schemas.android.com/apk/res/android');
        const attrs = Object.keys(supportsScreens);
        const contents = `<supports-screens ${attrs.map(a => `android:${a}="${supportsScreens[a]}"`).join(' ')}/>`;
        cfg.selectPlatform('android');
        cfg.addEditConfig('AndroidManifest.xml', '/manifest/supports-screens', 'merge', contents);
        cfg.selectRoot();
    }
    return cfg.write();
};
//# sourceMappingURL=config.js.map