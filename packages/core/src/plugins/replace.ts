/**
 * Copied rollup-plugin-replace, but removed
 * magicstring to avoid massive memory usage
 * This means no more sourcemaps
 * TODO: Find a way to use the oroginal plugin. Maybe contact the author about the issue
 */
import { createFilter } from 'rollup-pluginutils';

function escape(str) {
    return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

function ensureFunction(functionOrValue) {
    if (typeof functionOrValue === 'function') return functionOrValue;
    return () => functionOrValue;
}

function longest(a, b) {
    return b.length - a.length;
}

function getReplacements(options) {
    if (options.values) {
        return Object.assign({}, options.values);
    }
    const values = Object.assign({}, options);
    delete values.delimiters;
    delete values.include;
    delete values.exclude;
    delete values.sourcemap;
    delete values.sourceMap;
    return values;
}

function mapToFunctions(object) {
    return Object.keys(object).reduce((functions, key) => {
        functions[key] = ensureFunction(object[key]);
        return functions;
    }, {});
}

interface Options {
    include? : Array<string>;
    exclude? : Array<string>;
    delimiters? : Array<string>;
    values? : {};
}

export function replace(options : Options = {}) {
    const filter = createFilter(options.include, options.exclude);
    const { delimiters } = options;
    const functionValues = mapToFunctions(getReplacements(options));
    const keys = Object.keys(functionValues)
        .sort(longest)
        .map(escape);

    const pattern = delimiters
        ? new RegExp(`${escape(delimiters[0])}(${keys.join('|')})${escape(delimiters[1])}`, 'g')
        : new RegExp(`\\b(${keys.join('|')})\\b`, 'g');

    return {
        name: 'replace',

        transform(code, id) {
            if (!filter(id)) return null;

            let hasReplacements = false;
            let match;
            let start;
            let end;
            let replacement;
            let str = code;

            /* eslint no-cond-assign: 'off' */
            while ((match = pattern.exec(str))) {
                hasReplacements = true;

                start = match.index;
                end = start + match[0].length;
                replacement = String(functionValues[match[1]](id));

                str = str.substr(0, start) + replacement + str.substr(end);
            }

            if (!hasReplacements) return null;

            const result = { code: str };

            return result;
        },
    };
};
