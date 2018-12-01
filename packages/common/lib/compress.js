const acorn = require('acorn');
const walk = require('acorn-walk');
const htmlMinify = require('./html-minify');

function minifyTaggedTemplate(code, tag = 'html') {
    let result = code;

    walk.simple(acorn.parse(code, { sourceType: 'module' }), {
        TaggedTemplateExpression(node) {
            if ((node.tag.type === 'MemberExpression' && node.tag.property.name === tag) || node.tag.name === tag) {
                const { quasi } = node;
                const { start } = quasi.quasis[0];
                const { end } = quasi.quasis[quasi.quasis.length - 1];
                const htmlContent = code.substring(start, end);
                const minified = htmlMinify(htmlContent);
                result = `${code.slice(0, start)}${minified}${code.slice(end, code.length)}`;
            }
        },
    });

    return result;
}