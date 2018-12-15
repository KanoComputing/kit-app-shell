const { promisify } = require('util');
const request = require('request');
const fs = require('fs');

const post = promisify(request.post);

module.exports = (app, { user, key } = {}) => {
    if (!user) {
        return Promise.reject(new Error(`Could not upload to browserstack: Missing 'user' param`));
    }
    if (!key) {
        return Promise.reject(new Error(`Could not upload to browserstack: Missing 'key' param`));
    }
    return post({
        url: 'https://api-cloud.browserstack.com/app-automate/upload',
        formData: {
            file: fs.createReadStream(app),
        },
        auth: {
            user,
            pass: key,
        },
    }).then((response) => {
        return JSON.parse(response.body);
    });
};
