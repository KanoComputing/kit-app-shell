const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');

// TODO: Missing test
function copy(src, dest) {
    const out = path.dirname(dest);
    return new Promise((resolve, reject) => {
        mkdirp(out, (err) => {
            if (err) {
                return reject(err);
            }
            const read = fs.createReadStream(src);
            const write = fs.createWriteStream(dest);
    
            read.on('error', reject);
            write.on('error', reject);
            write.on('finish', () => resolve());
    
            read.pipe(write);
        });
    });
}

module.exports = {
    copy,
};
