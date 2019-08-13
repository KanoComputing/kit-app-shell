import * as path from 'path';
import { execSync } from 'child_process';

export function openXcodeProject(projectPath : string, name : string) {
    const xcodeProjectPath = path.join(projectPath, 'platforms/ios', `${name}.xcodeproj`);
    execSync(`open "${xcodeProjectPath}"`);
}