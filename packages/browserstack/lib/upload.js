const { promisify } = require('util');
const request = require('request');
const fs = require('fs');

const post = promisify(request.post);

const BS_UPLOAD_URL = 'https://api-cloud.browserstack.com/app-automate/upload';

/**
 * Uploads an app to browserstack
 * @param {String} app Path to the app to upload
 * @param {{ user: String, key: String }} param1 Browserstack credentials
 */
function upload(app, { user, key } = {}) {
    if (!user) {
        return Promise.reject(new Error(`Could not upload to browserstack: Missing 'user' param`));
    }
    if (!key) {
        return Promise.reject(new Error(`Could not upload to browserstack: Missing 'key' param`));
    }
    return post({
        url: BS_UPLOAD_URL,
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
}

module.exports = upload;
