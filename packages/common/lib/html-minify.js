const htmlAutoprefixer = require('html-autoprefixer');
const minifier = require('html-minifier');

module.exports = (content) => {
    const transformed = htmlAutoprefixer.process(content);
    return minifier.minify(transformed, {
        removeAttributeQuotes: true,
        collapseInlineTagWhitespace: true,
        collapseWhitespace: true,
        minifyCSS: true,
        removeComments: true,
    });
}