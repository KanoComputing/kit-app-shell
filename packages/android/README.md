# KASH android

Android support for kit-app projects

## Installation

```
yarn global add @kano/kit-app-shell-android
```

## Usage

Create a project following the guide at [@kano/kit-app-shell-core](../core). Then run

```
kash run android ./
```

This will create an android application from your project, install it on a connected android device and launch the application.
This application linked to your local sources. Your files are watched and the application will refresh on changes.

```
kash build android ./
```

This will create an .apk with your application, transpiled and compressed.

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

In your project's config (`config/*.json`), you can add:

```json
{
    "ICONS": {
        "ANDROID": "assets/app/android/icon.png"
    },
    "SPLASHSCREENS": {
        "ANDROID": "assets/app/android/screen.png"
    }
}
```

The icon will be used to generate all the necessary icons for an android project, so make sure it is at least 512x512, same thing goes for the splashcreen, it will be cropped to fit the screens.
To support landsapce and portrait orientations, provide a large square splashcreen.

## TODO:

 - run: Only work on target platforms with Chrome 61+ for es6 imports. Add a flag to transpile on the fly with livereload watch. Rollup connect middleware?