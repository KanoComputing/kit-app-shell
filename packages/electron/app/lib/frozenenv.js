const fs = require('fs');
const path = require('path');

try {
    const env = fs.readFileSync(path.join(__dirname, '../env.txt'));
    process.env.NODE_ENV = env;
    process.env.BUNDLED = true;
} catch(e) {}
