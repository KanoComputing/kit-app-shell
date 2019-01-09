export interface INodeTree {
    nodeName : string,
    tagName : string,
    attrs : Array<{ [key : string] : string|number }>,
    namespaceURI : string,
    childNodes : Array<{ nodeName : string, value : string|number|INodeTree }>,
    parentNode: INodeTree|null,
}

export function createScript(src : string) : INodeTree {
    return {
        nodeName: 'script',
        tagName: 'script',
        attrs: [{
            name: 'src',
            value: src,
        }],
        namespaceURI: 'http://www.w3.org/1999/xhtml',
        childNodes: [],
        parentNode: null,
    };
}
export function createScriptWithContent(content : string) : INodeTree {
    return {
        nodeName: 'script',
        tagName: 'script',
        attrs: [],
        namespaceURI: 'http://www.w3.org/1999/xhtml',
        childNodes: [{
            nodeName: '#text',
            value: content,
        }],
        parentNode: null,
    };
}
