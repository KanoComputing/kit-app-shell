# kash — Kit App SHell

_kash_ is a web app platform built on top of [Electron](https://electronjs.org/) and [Cordova](https://cordova.apache.org/) that allows us to develop, test and deploy applications that interact with Kano hardware kits across several desktop and mobile platforms as well as the web from a single codebase.

The shell will run any HTML/CSS/JS frontend. On all platforms extept _web_, it allows the app to communicate with Kano bluetooth/serial devices using the [@kano/devices-sdk](https://github.com/KanoComputing/kano-devices-sdk).

The `kash` CLI tool provides an unified interface to build, run, test and sign your app across all [supported platforms](#Platforms). The usual workflow looks like this:

```sh
yarn add --dev @kano/kit-app-shell-cli

# Install the platforms you want to use
yarn add --dev @kano/kit-app-shell-macos
yarn add --dev @kano/kit-app-shell-ios
```

Add the kash script to your `package.json`

```json
{
    "scripts": {
        "kash": "kash"
    }
}
```

This makes your local version of cache accessible using `yarn kash`

```
# Build an *.ipa for iOS using Cordova
yarn kash build ios ./your-app-dir --out ./build-dir

# Run your app using electron on macOS
yarn kash run macos ./your-app-dir
```

## Setup

Depending on the platforms you're planning to use, you might need to set up a different set of external tools on your system (xcode, Android Studio, etc).

_TODO: Figure this out._

## Usage

`kash` has a sub-comand-based interface. The commands are platform-specific. Make sure the platform you want to use is installed.

```
Usage: kash <command> <platform> [options]
```

Here's an overview:

### run

Starts the app locally with live reload for development purposes. The behaviour of `run` depends on the target platform. For Cordova-based platforms, it will build an app and deploy it to a test device (if available). See the platform-specific notes for more information.

**Example**:

```
kash run ios ../app-folder
```

### build

Builds the app for the selected platform. The build will be stored in the directory specified by the `-o, --out` parameter.

**Example**:

```
kash build ios ../app-folder -o ../output-dir
```

### configure

A CLI-based UI will walk you through the set up required for each platform. The configuration is system-wide and shared between different projects. You might need to run this before you first build.

### test

Runs integration tests against a prebuilt app (specified via `--prebuilt-app`).

**Example**:

```
kash test ios ../app-folder --prebuilt-app ../output-dir/app-build.ipa
```

### sign

Sign a build for distribution. Not every platform implements this command.

**Example**:

```
kash sign macos ../output-dir/app-build.ipa
```

## Creating a New App

This guide explains how to set up a minimal app using `kash` and try it out using the _web_ platform. We'll start with an empty app directory:

```sh
mkdir kash-example
cd kash-example
```

We'll install the `kash` CLI tool and the _web_ platform.

```sh
yarn add --dev @kano/kit-app-shell-cli
yarn add --dev @kano/kit-app-shell-web
```

Add the kash script to your `package.json`

```json
{
    "scripts": {
        "kash": "kash"
    }
}
```

This makes your local version of cache accessible using `yarn kash`

When starting up, the app shell will be looking for two files:

* `config/default.json` to provide info necessary to build the app
* `index.js` to define a class that will bootstrap the UI

In the config, we'll need to set the `APP_ID` and `APP_NAME` options. These will be used by Cordova/Electron when building the app. You can also provide environment-specific configs (e.g., `staging.json`, `production.json`) in the same directory. To learn more about that, see the [TODO comprehensive guide](#TODO). In this case, `config/default.json` will be enough:

```json
{
    "APP_ID": "com.example.app",
    "APP_NAME": "Example App"
}
```

Then we'll need to define the main class in `index.js`:

```js
class ExampleApp {
    constructor(bus, config) {
        this.root = document.createElement('div');
        this.root.innerText = `${config.APP_NAME} - ${config.ENV}`;
    }
}

Shell.define(ExampleApp);
```

The app shell will pass to the constructor a reference to the `bus` that can be used to communicate with devices and `config` to access the app configuration above. It will expect you to initialise the `root` property with your app's UI which will be stamped to the DOM when the app loads. For the purposes of this example, we create a simple `div` with the application's name in it.

With the main class in place, we can test the setup on the _web_ platform by running `kash` from the project tree as follows:

```sh
yarn kash run web .
```

The _web_ platform will start a simple web server.

<img src="https://user-images.githubusercontent.com/169328/51049160-f1710500-15c4-11e9-9e05-b2b6110fe7ec.png" width="486">

You can test the app by going to http://localhost:4000:

<img src="https://user-images.githubusercontent.com/169328/51050307-39455b80-15c8-11e9-9591-090c6c216650.png" width="400">

## Development

This repository contains the CLI, core module and platform implementation for the App Shell platform

This repository uses lerna and yarn workspaces to manage dependencies, development and tests of its packages

Pull the dependencies with `lerna bootstrap`.

Use `yarn tsc -b --watch` to run the typescript compiler on the whole codebase. This will watch changes and run incremental builds, then you can work on one of the following:

## Packages

![Dependencies](https://user-images.githubusercontent.com/169328/50916494-35cc9b80-1433-11e9-98b3-bbe5e7431709.png)

## [@kano/kit-app-shell-core](./packages/core)

Kash core. Contains the platforms shared features. Used to bundle, run or test apps.
Also contains utilities like logging and config loading

## Tools

### [@kano/kit-app-shell-cli](./packages/cli)

Kash CLI. Run, build, test from your command line.

### [@kano/kit-app-shell-test](./packages/test)

Utilities to run tests on remote device providers.

## Platform Libraries

### [@kano/kit-app-shell-electron](./packages/electron)

Kash desktop platform. Runs your app using electron. To build for desktop, use `windows` or `macos`.

### [@kano/kit-app-shell-cordova](./packages/cordova)

Uses the cordova project to create mobile apps.

## Platforms

### [@kano/kit-app-shell-windows](./packages/windows)

Extends the electron platform. Used to build a windows application and create an installer.

### [@kano/kit-app-shell-windows-store](./packages/windows-store)

Extends the windows platform and builds an `appx` package instead of a windows installer.

### [@kano/kit-app-shell-macos](./packages/macos)

Extends the electron platform. Used to build a macOS application and create a `.app` package.

### [@kano/kit-app-shell-kano](./packages/kano)

Extends the electron platform. Used to build a Kano OS application and create a `.deb` package.

### [@kano/kit-app-shell-android](./packages/android)

Extends the cordova platform to create a .apk.

### [@kano/kit-app-shell-android-legacy](./packages/android-legacy)

Extends the android platform to create a .apk using crosswalk as a webview.

### [@kano/kit-app-shell-ios](./packages/ios)

Extends the cordova platform to create an iOS app.

### [@kano/kit-app-shell-web](./packages/web)

Kash web platform. Runs your app in a browser. Builds a hostable website.

## Coding style

This project runs on the Node.js platform and will try to embrace it when possible. It uses commonjs modules to run on node with no transpilation. TODO: Investigate transpiled .mjs that will become sources once modules are shipped.

Asychronous tasks uses Promises and APIs using callbacks are wrapped using `util.promisify`. This will allow an easy transition to async functions if needed. TODO: Investigate async function.

Object merging: Use `Object.assign` when possible. `deepmerge` if necessary.

## dependencies

To keep this project's slim and fast, dependencies need to be reviewed to ensure they provide the deisred functionality with the smallest downloaded package size and even smaller loaded file size if possible.

With tha in mind, every packages in this repository need to rely on the same packages for the same features to avoid unnecessary duplications.

|Feature| Package | Reason |
|---|---|---|
|Terminal colors|`chalk`|Slim and performant|
|CLI|`sywac`|No dependencies, similar but outperforms yargs|
|Testing|`mocha`|Opiniated|
|Assertion|`chai`<br>`chai-fs`|Opiniated|
|Mock|`mock-fs`<br>`mock-require`|Opiniated|
|Coverage|`nyc`|Opiniated|
|FS managment|`mkdirp`<br>`rimraf`|Opiniated|
|Pattern matching|`glob`|Opiniated TODO: try `fast-glob`|
|Object merging|`deepmerge`|No dependencies|
|HTML parsing|`parse5`|Fastest and spec compliant|
|JS parsing|`acorn`|Small and fast|
|XML parsing|`elementtree`|Used by `cordova-config` TODO: move away from `cordova-config` if it improves performances|
|Image manipulation|`sharp`|Cross platform, high speed, no dependencies|
|HTTP and HTTPS|`request`|Complete, supports stream|
|Server|`connect`<br>`cors`<br>`serve-static`|Fast, lots of middlewares|

## Roadmap

TODOs for 0.0.3-alpha.4:

 - Allow for env var defining tmp directory. This can be used in docker containers so thay can persist the cache across builds
 - ...

## TODO:
 - Create a Dockerfile with the setup to create on any platform. Host the image on dockerhub
 - Add a `bootstrap/setup/doctor` subcommand that each platform will help users set up their environment for building apps for various platforms (e.g. XCode setup, Android Studio, Windows build tools)
