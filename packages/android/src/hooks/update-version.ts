import * as path from 'path';
import * as fs from 'fs';

const buildPath = 'platforms/android/build.gradle';
const projectPath = 'platforms/android/project.properties';

const targetReg = /target=android-(\d+)/;
const defaultTargetReg = /defaultTargetSdkVersion=(\d+)/;
const defaultCompileReg = /defaultCompileSdkVersion=(\d+)/;

function replace(filePath, replacements) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const replaced = replacements.reduce((acc, rep) => acc.replace(rep.reg, rep.replace), content);
    fs.writeFileSync(filePath, replaced);
}

/**
 * Modifies the android project to use 28 as its target sdk
 */
export = (ctx) => {
    replace(path.join(ctx.opts.projectRoot, projectPath), [{
        reg: targetReg,
        replace: () => 'target=android-28',
    }]);
    replace(path.join(ctx.opts.projectRoot, buildPath), [{
        reg: defaultTargetReg,
        replace: () => 'defaultTargetSdkVersion=28',
    }, {
        reg: defaultCompileReg,
        replace: () => 'defaultCompileSdkVersion=28',
    }]);
};
