import { DefaultTreeElement, DefaultTreeTextNode } from 'parse5';

export function createScript(src : string) : DefaultTreeElement {
    return {
        nodeName: 'script',
        tagName: 'script',
        attrs: [{
            name: 'src',
            value: src,
        }],
        namespaceURI: 'http://www.w3.org/1999/xhtml',
        childNodes: [],
        parentNode: {
            childNodes: [],
        },
    };
}
export function createScriptWithContent(content : string) : DefaultTreeElement {
    return {
        nodeName: 'script',
        tagName: 'script',
        attrs: [],
        namespaceURI: 'http://www.w3.org/1999/xhtml',
        childNodes: [{
            nodeName: '#text',
            value: content,
        } as DefaultTreeTextNode],
        parentNode: {
            childNodes: [],
        },
    };
}
