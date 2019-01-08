"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const parse5 = require("parse5");
const walk = require("walk-parse5");
const parse5Util = require("./parse5/util");
function replaceIndex(html, js, code) {
    const htmlDir = path.dirname(html);
    const relJs = `./${path.relative(htmlDir, js)}`.replace(/\\/g, '/');
    const document = parse5.parse(code);
    walk(document, (node) => {
        if (node.tagName === 'script') {
            let attr;
            for (let i = 0; i < node.attrs.length; i += 1) {
                attr = node.attrs[i];
                if (attr.name === 'src' && attr.value === relJs) {
                    const { childNodes } = node.parentNode;
                    const script = parse5Util.createScriptWithContent(`
                        require.config({ timeout: 30 });
                        requirejs(['${relJs}']);
                    `);
                    childNodes.splice(childNodes.indexOf(node), 1, script);
                    script.parentNode = node.parentNode;
                    return false;
                }
            }
        }
        return true;
    });
    return parse5.serialize(document);
}
exports.replaceIndex = replaceIndex;
function addRequirejs(code) {
    const document = parse5.parse(code);
    walk(document, (node) => {
        if (node.tagName === 'head') {
            const script = {
                nodeName: 'script',
                tagName: 'script',
                attrs: [{
                        name: 'src',
                        value: '/require.js',
                    }],
                namespaceURI: 'http://www.w3.org/1999/xhtml',
                childNodes: [],
            };
            node.childNodes.push(script);
            return false;
        }
        return true;
    });
    return parse5.serialize(document);
}
exports.addRequirejs = addRequirejs;
//# sourceMappingURL=html.js.map