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
    };
}

module.exports = {
    createScript,
    createScriptWithContent,
};
