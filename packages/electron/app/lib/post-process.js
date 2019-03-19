const { Readable } = require('stream');
const { resolveNamedPath } = require('@kano/es6-resolution');

module.exports = (rootDir) => {
    return (stream, mime, url) => {
        if (mime !== 'text/html' && mime !== 'application/javascript') {
            return stream;
        }
        let buffer = '';
        const final = new Readable({});
        stream.on('data', d => buffer += d.toString());
        stream.on('end', () => {
            const newBody = resolveNamedPath(rootDir, buffer, mime, stream.path);
            final.push(newBody);
            final.push(null);
        });
        stream.on('error', e => final.emit('error', e));
        return final;
    };
};
