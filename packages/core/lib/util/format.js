/**
 * TODO: TESTS!!!!!!
 */

/**
 * Transform a string to PascalCase.
 */
function pascal(s) {
    return s.replace(/(\w)(\w*)/g, (g0, g1, g2) => `${g1.toUpperCase()}${g2.toLowerCase()}`).replace(/ /g, '');
}

/**
 * Transform a string to kebab-case.
 */
function kebab(name) {
    return name.toLowerCase().replace(/ /g, '-').replace(/(-)\1+/, '-');
}

/**
 * Transform a string to snake_case.
 */
function snake(name) {
    return name.replace(/ /g, '_');
}

module.exports = {
    pascal,
    kebab,
    snake,
};
