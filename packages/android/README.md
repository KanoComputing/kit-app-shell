# KASH android

Android support for kit-app projects

## Options

In your project's kash-config file, you can configure the android build as follow:

```js
/**
 * @type {import('@kano/kit-app-shell-core/types').KashConfig}
 */
module.exports = {
    android: {
        minSdkVersion: 21,
        maxSdkVersion: 28,
        preferences: {
            // Here drop cordova preferences for your project. See https://cordova.apache.org/docs/en/latest/config_ref/#preference
        },
        supportsScreens: {
            anyDensity: true,
            smallScreens: false,
            normalScreens: false,
            largeScreens: true,
            xlargeScreens: true,
        },
    },
};
```
