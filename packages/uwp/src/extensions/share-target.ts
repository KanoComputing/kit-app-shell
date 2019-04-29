import { IExtensionDefinition, IExtensionProvider } from './extension.js';

export interface IShareTargetDefinition extends IExtensionDefinition {
    DESCRIPTION : string;
    DATA_FORMAT : 'Text'|'Uri'|'Bitmap'|'HTML'|'StorageItems'|'RTF';
    SUPPORTED_FILE_TYPES? : string[];
}

export const ShareTargetProvider : IExtensionProvider = {
    render(definition : IShareTargetDefinition) {
        return `
            <uap:Extension Category="windows.shareTarget">
                <uap:ShareTarget Description="${definition.DESCRIPTION}">
                    ${(definition.SUPPORTED_FILE_TYPES || []).map((s) => `
                        <uap:SupportedFileTypes>
                            <uap:FileType>${s}</uap:FileType>
                        </uap:SupportedFileTypes>
                    `)}
                    <uap:DataFormat>${definition.DATA_FORMAT}</uap:DataFormat>
                </uap:ShareTarget>
            </uap:Extension>
        `;
    },
};
