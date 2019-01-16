/**
 * Copied rollup-plugin-replace, but removed
 * magicstring to avoid massive memory usage
 * This means no more sourcemaps
 * TODO: Find a way to use the original plugin. Maybe contact the author about the issue
 */
import { createFilter } from 'rollup-pluginutils';

function escape(str : string) {
    return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

function ensureFunction<T>(functionOrValue : () => T|T) {
    if (typeof functionOrValue === 'function') { return functionOrValue; }
    return () => functionOrValue;
}

function longest(a : string, b : string) {
    return b.length - a.length;
}

function getReplacements(options : IReplaceOptions) {
    if (options.values) {
        return Object.assign({}, options.values);
    }
    const values = Object.assign({}, options);
    delete values.delimiters;
    delete values.include;
    delete values.exclude;
    return values;
}

function mapToFunctions(object : { [propName : string] : any }) {
    return Object.keys(object).reduce((functions, key) => {
        functions[key] = ensureFunction<string>(object[key]);
        return functions;
    }, {} as { [propName : string] : any });
}

export interface IReplaceOptions {
    include? : string[];
    exclude? : string[];
    delimiters? : string[];
    values? : {};
}

export function replace(options : IReplaceOptions = {}) {
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

        transform(code : string, id : string) {
            if (!filter(id)) { return null; }

            let hasReplacements = false;
            let match;
            let start;
            let end;
            let replacement;
            let str = code;

            // tslint:disable-next-line:no-conditional-assignment
            while ((match = pattern.exec(str))) {
                hasReplacements = true;

                start = match.index;
                end = start + match[0].length;
                replacement = String(functionValues[match[1]](id));

                str = str.substr(0, start) + replacement + str.substr(end);
            }

            if (!hasReplacements) { return null; }

            const result = { code: str };

            return result;
        },
    };
}
