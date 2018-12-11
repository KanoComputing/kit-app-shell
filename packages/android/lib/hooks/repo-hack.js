const fs = require('fs');
const path = require('path');

module.exports = (context) => {
    const file = path.join(context.opts.projectRoot, 'platforms/android/CordovaLib/build.gradle');

    const content = fs.readFileSync(file, 'utf-8');

    const replaced = content.replace('jcenter()', 'google()\n        jcenter()')

    fs.writeFileSync(file, replaced, 'utf-8');
}