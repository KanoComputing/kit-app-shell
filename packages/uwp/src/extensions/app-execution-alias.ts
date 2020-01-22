import { IExtensionDefinition, IExtensionProvider } from './extension.js';

export interface IAppExecutionAliasDefinition extends IExtensionDefinition {
    DISPLAY_NAME : string;
}

export const AppExecutionAliasProvider : IExtensionProvider = {
    render(definition: IAppExecutionAliasDefinition) {
        return `
            <uap5:AppExecutionAlias>
                <uap5:ExecutionAlias Alias="${definition.DISPLAY_NAME}.exe" />
            </uap5:AppExecutionAlias>
        `;
    },
};
