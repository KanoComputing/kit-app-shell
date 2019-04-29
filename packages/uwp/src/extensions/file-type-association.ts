import { IExtensionDefinition, IExtensionProvider } from './extension.js';

export interface ISupportedFileType {
    CONTENT_TYPE : string;
    FILE_TYPE : string;
}

export interface IFileTypeAscociationDefinition extends IExtensionDefinition {
    DISPLAY_NAME? : string;
    NAME : string;
    LOGO? : string;
    INFO_TIP? : string;
    SUPPORTED_FILE_TYPES? : ISupportedFileType[];
}

export const FileTypeAssociationProvider : IExtensionProvider = {
    render(definition : IFileTypeAscociationDefinition) {
        return `
            <uap:Extension Category="windows.fileTypeAssociation">
                <uap:FileTypeAssociation Name="${definition.NAME}">
                    ${definition.DISPLAY_NAME ? `<uap:DisplayName>${definition.DISPLAY_NAME}</uap:DisplayName>` : ''}
                    ${definition.LOGO ? `<uap:Logo>www/www/${definition.LOGO}</uap:Logo>` : ''}
                    ${definition.INFO_TIP ? `<uap:InfoTip>${definition.INFO_TIP}</uap:InfoTip>` : ''}
                    ${(definition.SUPPORTED_FILE_TYPES || []).map((s) => `
                        <uap:SupportedFileTypes>
                            <uap:FileType ContentType="${s.CONTENT_TYPE}">${s.FILE_TYPE}</uap:FileType>
                        </uap:SupportedFileTypes>
                    `)}
                </uap:FileTypeAssociation>
            </uap:Extension>
        `;
    },
};
