import { AppExecutionAliasProvider } from './extensions/app-execution-alias.js'
import { FileTypeAssociationProvider } from './extensions/file-type-association.js';
import { IExtensionProvider } from './extensions/extension.js';
import { ShareTargetProvider } from './extensions/share-target.js';

export const extensions : { [K : string] : IExtensionProvider } = {
    APP_EXECUTION_ALIAS: AppExecutionAliasProvider,
    FILE_TYPE_ASSOCIATION: FileTypeAssociationProvider,
    SHARE_TARGET: ShareTargetProvider,
};
