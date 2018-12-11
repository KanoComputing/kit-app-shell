const path = require('path');
const fs = require('fs');

const buildPath = 'platforms/android/build.gradle';
const projectPath = 'platforms/android/project.properties';

const targetReg = /target=android-(\d+)/;
const defaultTargetReg = /defaultTargetSdkVersion=(\d+)/;
const defaultCompileReg = /defaultCompileSdkVersion=(\d+)/;

function replace(filePath, replacements) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const replaced = replacements.reduce((acc, rep) => {
        return acc.replace(rep.reg, rep.replace);
    }, content);
    fs.writeFileSync(filePath, replaced);
}

/**
 * Modifies the android project to use 28 as its target sdk
 */
module.exports = (ctx) => {
    replace(path.join(ctx.opts.projectRoot, projectPath), [{
        reg: targetReg,
        replace: () => {
            return `target=android-28`;
        },
    }]);
    replace(path.join(ctx.opts.projectRoot, buildPath), [{
        reg: defaultTargetReg,
        replace: () => {
            return `defaultTargetSdkVersion=28`;
        },
    }, {
        reg: defaultCompileReg,
        replace: () => {
            return `defaultCompileSdkVersion=28`;
        },
    }]);
};
