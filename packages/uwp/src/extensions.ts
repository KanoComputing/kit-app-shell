import { FileTypeAssociationProvider } from './extensions/file-type-association.js';
import { IExtensionProvider } from './extensions/extension.js';
import { ShareTargetProvider } from './extensions/share-target.js';

export const extensions : { [K : string] : IExtensionProvider } = {
    FILE_TYPE_ASSOCIATION: FileTypeAssociationProvider,
    SHARE_TARGET: ShareTargetProvider,
};
