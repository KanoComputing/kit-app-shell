import { FileTypeAssociationProvider } from './extensions/file-type-association.js';
import { IExtensionProvider } from './extensions/extension.js';

export const extensions : { [K : string] : IExtensionProvider } = {
    FILE_TYPE_ASSOCIATION: FileTypeAssociationProvider,
};
