import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { verify } from './verify';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const templatePath = path.join(__dirname, '../../link-template.js');

const ENTRY_TEMPLATE = `
snapshotResult.setGlobals(global, process, global, {}, console, require);
snapshotResult.customRequire('./_snapshot.js').main();
`;

function generateDefinition(source : string) {
    const transformed = [
        'function (exports, module, __filename, __dirname, require, define) {\nexports.main = () => {\n',
        source,
        '\n};\n}',
    ].join('');

    return transformed;
}

/**
 * Generate a file with the bootstrap code to run a provided source file as entry file
 * @param src Entry file of the application
 * @param out Destination file
 */
export function generateSnapshotSource(src : string, out : string) {
    return readFile(src, 'utf-8')
        .then((source) => {
            return readFile(templatePath, 'utf-8')
                .then((templateSource) => {
                    const definition = generateDefinition(source);
                    const definitionsAssignment = 'customRequire.definitions = {}';
                    const definitionsAssignmentStartIndex = templateSource.indexOf(definitionsAssignment);
                    const definitionsAssignmentEndIndex =
                        definitionsAssignmentStartIndex + definitionsAssignment.length;
                    const final = templateSource.slice(0, definitionsAssignmentStartIndex) +
                    `var snapshotAuxiliaryData = ${['customRequire.definitions = {\n\'./_snapshot.js\': ', definition, ',\n}'].join('')};` +
                    templateSource.slice(definitionsAssignmentEndIndex);
                    verify(final, path.dirname(out));
                    return writeFile(out, final, 'utf-8').then(() => out);
                });
        });
}

export function generateEntryFile(out : string) {
    return writeFile(out, ENTRY_TEMPLATE, 'utf-8');
}
