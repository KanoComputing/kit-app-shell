const minifier = require('html-minifier');
const HTMLPostCSS = require('html-postcss');

const processHtml = new HTMLPostCSS([]);

module.exports = (content) => {
    const transformed = processHtml.process(htmlContent);
    return minifier.minify(transformed, {
        removeAttributeQuotes: true,
        collapseInlineTagWhitespace: true,
        collapseWhitespace: true,
        minifyCSS: true,
        removeComments: true,
    });
};
