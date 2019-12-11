import * as path from 'path';
import pascal = require('pascal-case');
import { fromTemplate, copy } from '@kano/kit-app-shell-core/lib/util/fs';
import { getCachePath } from '@kano/kit-app-shell-core/lib/tmp';
import * as rimrafCb from 'rimraf';
import mkdirpCb = require('mkdirp');
import { promisify } from 'util';
import { IKashConfig } from '@kano/kit-app-shell-core/lib/types';
import { generateIconsWithScale } from '@kano/kit-app-shell-windows-store/lib/icons';
import { extensions } from './extensions';
import { IExtensionDefinition } from './extensions/extension';
import { copyResources, IResources } from '@kano/kit-app-shell-core/lib/util/resource';

const rimraf = promisify(rimrafCb);
const mkdirp = promisify(mkdirpCb);

export interface ISolutionPaths {
    solution : string;
    project : string;
}

export interface IProjectOptions {
    app : string;
    config : IKashConfig;
    certificates : { [K : string] : string };
    capabilities? : string[];
    additionalResources? : IResources;
}

const defaultCapabilities = ['bluetooth'];

function generateContentInclude(resources : IResources) {
    return resources.map((res) => {
        let relSrc = '';
        if (typeof res === 'string') {
            relSrc = res;
        } else {
            relSrc = res.src;
        }
        return `<Content Include="${path.basename(relSrc)}" />`;
    }).join('')
}

export function generateProject(
    tlpDir : string, options : IProjectOptions, certPath : string) : Promise<ISolutionPaths> {
    const { config } = options;
    const TMP_DIR = path.join(getCachePath(), 'uwp', 'hash');
    const data = Object.assign({
        PROJECT_NAME: pascal(config.APP_NAME),
    }, config);

    if (!config.UWP) {
        throw new Error('UWP section missing in config');
    }

    const certificateName = 'DevCert.pfx';

    Object.assign(data, config.UWP);

    data.START_PAGE = `ms-appx-web://${data.PACKAGE_NAME}/www/index.html`;
    data.CERTIFICATE = certificateName;

    data.CAPABILITIES = (options.capabilities || [])
        .filter((c) => defaultCapabilities.indexOf(c) === -1)
        .map((c) => `<DeviceCapability Name="${c}" />`);

    data.TILE_BACKGROUND = data.TILE_BACKGROUND || 'transparent';

    if (config.UWP.EXTENSIONS) {
        const exts = config.UWP.EXTENSIONS.map((definition : IExtensionDefinition) => {
            const provider = extensions[definition.TYPE];
            if (!provider) {
                throw new Error(`Could not create project: Extension '${definition.TYPE}' does not exists`);
            }
            return provider.render(definition);
        });
        if (exts.length) {
            data.EXTENSIONS = `
            <Extensions>
                ${exts.join('\n')}
            </Extensions>
            `;
        } else {
            data.EXTENSIONS = '';
        }
    }

    if (options.additionalResources) {
        data.EXTRA_CONTENT = generateContentInclude(options.additionalResources);
    }

    if (!config.APP_DESCRIPTION) {
        throw new Error('Cannot create UWP project: Missing APP_DESCRIPTION in config');
    }

    const projectDir = path.join(TMP_DIR, data.PROJECT_NAME);
    const solutionFilename = path.join(TMP_DIR, `${data.PROJECT_NAME}.sln`);
    const jsprojFilename = path.join(TMP_DIR, `${data.PROJECT_NAME}/${data.PROJECT_NAME}.jsproj`);
    const appxmanifestFilename = path.join(TMP_DIR, `${data.PROJECT_NAME}/package.appxmanifest`);

    const imagesDir = path.join(projectDir, 'images');

    return rimraf(TMP_DIR)
        .then(() => {
            if (options.additionalResources) {
                return copyResources(options.additionalResources, projectDir, options.app);
            }
        })
        .then(() => fromTemplate(path.join(tlpDir, '_Solution.sln'), solutionFilename, data))
        .then(() => fromTemplate(path.join(tlpDir, '_Project/_Project.jsproj'), jsprojFilename, data))
        .then(() => fromTemplate(path.join(tlpDir, '_Project/package.appxmanifest'), appxmanifestFilename, data))
        .then(() => copy(path.join(tlpDir, '_Project/msapp-error.css'), path.join(projectDir, 'msapp-error.css')))
        .then(() => copy(path.join(tlpDir, '_Project/msapp-error.html'), path.join(projectDir, 'msapp-error.html')))
        .then(() => copy(path.join(tlpDir, '_Project/msapp-error.js'), path.join(projectDir, 'msapp-error.js')))
        .then(() => copy(certPath, path.join(projectDir, certificateName)))
        .then(() => mkdirp(imagesDir))
        .then(() => {
            if (!config.ICONS || !config.ICONS.UWP) {
                return;
            }
            const def = typeof config.ICONS.UWP === 'object' ? config.ICONS.UWP.DEFAULT : config.ICONS.UWP;
            if (typeof def !== 'string') {
                return;
            }
            return generateIconsWithScale(path.join(projectDir, 'images'), options.app, def, config.UWP);
        })
        .then(() => {
            return {
                solution: TMP_DIR,
                project: projectDir,
            };
        });
}
