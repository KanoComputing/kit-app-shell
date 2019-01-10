import { ElectronBuildOptions } from '@kano/kit-app-shell-electron/lib/types';

export type KanoBuildOptions = ElectronBuildOptions & {
    ['skip-ar']? : boolean;
}