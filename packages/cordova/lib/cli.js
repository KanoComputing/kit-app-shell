"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    commands(sywac) {
        sywac.boolean('--no-cache', {
            defaultValue: false,
            desc: 'Create a new cordova project for this build',
        });
    },
    build(sywac) {
        sywac.boolean('--run', {
            defaultValue: false,
            desc: 'Runs the app after building on an available connected device',
        });
    },
    test(sywac) {
        sywac.string('--provider', {
            defaultValue: 'local',
            desc: 'Which device provider to use',
        });
    },
};
//# sourceMappingURL=cli.js.map