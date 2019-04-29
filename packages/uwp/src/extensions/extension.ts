export interface IExtensionDefinition {
    TYPE : string;
    ENTRY_POINT? : string;
}

export interface IExtensionProvider {
    render(definition : IExtensionDefinition) : string;
}
