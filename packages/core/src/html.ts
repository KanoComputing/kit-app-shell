import * as path from 'path';
import * as parse5 from 'parse5';
import * as walk from 'walk-parse5';
import * as parse5Util from './parse5/util';

export function replaceIndex(html : string, js : string, code : string) : string {
    const htmlDir = path.dirname(html);
    const relJs = `./${path.relative(htmlDir, js)}`.replace(/\\/g, '/');
    const document = parse5.parse(code);
    // Find a potential script node that loads the js
    walk(document, (node) => {
        if (node.tagName === 'script') {
            let attr;
            for (let i = 0; i < node.attrs.length; i += 1) {
                attr = node.attrs[i];
                // Found if the relative path matches the src
                if (attr.name === 'src' && attr.value === relJs) {
                    const { childNodes } = node.parentNode;
                    const script = parse5Util.createScriptWithContent(`
                        require.config({ timeout: 30 });
                        requirejs(['${relJs}']);
                    `);
                    // Remove the node and replace it with a simple script with src
                    // This ensures imports with module type are stripped out
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

export function addRequirejs(code : string) : string {
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
