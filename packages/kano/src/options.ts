import { ElectronBuildOptions } from '@kano/kit-app-shell-electron/lib/options';

export type KanoBuildOptions = ElectronBuildOptions & {
    ['skip-ar']? : boolean;
}