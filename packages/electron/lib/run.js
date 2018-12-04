const electroner = require('electroner');
const path = require('path');


function run({ app }, {}, platform) {
    if (!platform) {
        throw new Error(`Could not run app: 'electron' is not a valid platform`);
    }

    electroner(path.join(__dirname, '../app'));
}

module.exports = run;
