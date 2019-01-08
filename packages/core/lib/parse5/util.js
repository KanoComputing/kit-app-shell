"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createScript(src) {
    return {
        nodeName: 'script',
        tagName: 'script',
        attrs: [{
                name: 'src',
                value: src,
            }],
        namespaceURI: 'http://www.w3.org/1999/xhtml',
        childNodes: [],
    };
}
exports.createScript = createScript;
function createScriptWithContent(content) {
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
exports.createScriptWithContent = createScriptWithContent;
//# sourceMappingURL=util.js.map