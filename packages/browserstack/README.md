# `@kano/kit-app-shell-browserstack`

Set of utility functions to integrate automated tests with Browserstack

## Usage

Use the upload function to upload an app package to Browserstack

See https://www.browserstack.com/app-automate/appium-node

```js
const { upload } = require('@kano/kit-app-shell-browserstack');

upload('/path/to/my/app.apk', { user: 'username', key: 'accecss-key' })
    .then(( app_url ) => {
        console.log(app_url); // Prints bs://<hashed app-id>
    });
```

## Development

 - Install dependencies with `yarn`
 - Run tests with `yarn test`
 - Generate coverage report with `yarn coverage`
