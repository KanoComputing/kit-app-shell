# kash — Kit App SHell

_kash_ is a web app platform built on top of [Electron](https://electronjs.org/) and [Cordova](https://cordova.apache.org/) that allows us to develop, test and deploy applications that interact with Kano hardware kits across several desktop and mobile platforms as well as the web from a single codebase.

The shell will run any HTML/CSS/JS frontend. On all platforms extept _web_, it allows the app to communicate with Kano bluetooth/serial devices using the [@kano/devices-sdk](https://github.com/KanoComputing/kano-devices-sdk).

The `kash` CLI tool provides an unified interface to build, run, test and sign your app across all [supported platforms](#Platforms). A minimal usage example:

```sh
yarn add @kano/kit-app-shell-cli

# Install the platforms you want to use
yarn add @kano/kit-app-shell-macos
yarn add @kano/kit-app-shell-ios

# Build an *.ipa for iOS using Cordova
kash build ios ./your-app-dir --out ./build-dir

# Run your app using electron on macOS
kash run macos ./your-app-dir
```

## Setup

Depending on the platforms you're planning to use, you might need to set up a different set of external tools (xcode, Android Studio, etc).

_TODO: Figure this out._

## Quickstart Guide

This guide will explain how to set up a minimal app using kash and run it on all the supported platforms. We'll start with an empty directory:

```sh
mkdir kash-example
cd kash-example
```

Then we install the `kash` CLI and the _web_ platform to start.

```sh
yarn add @kano/kit-app-shell-cli
yarn add @kano/kit-app-shell-web
```

We need to create a default config file and set the `APP_ID` and `APP_NAME` options. These will be used by Cordova/Electron under the hood when building the files. `kash` will be looking for the configuration in the `config/` directory.

```sh
mkdir config
```

It always loads `config/default.json`. You can also provide further environment-specific configuration (e.g., `staging.json`, `production.json`). To learn more about configuration, see the [TODO comprehensive guide](#TODO). We'll only create `default.json` with the following content:

```json
{
    "APP_ID": "com.example.app",
    "APP_NAME": "Example App"
}
```

Finally, we need to define the main class. The shell will use it to bootstrap the UI. We'll create `index.js` in the root of our project with the following code:

```js
class ExampleApp {
    constructor(bus, config) {
        this.root = document.createElement('div');
        this.root.innerText = `${config.APP_NAME} - ${config.ENV}`;
    }
}

Shell.define(ExampleApp);
```

The only thing we need to do is to set up the root element in the constructor. Note the available parameters. You can use `bus` to communicate with devices and `config` to access the app configuration.

Now we can test the setup. We'll use the version of kash installed in the project tree.

```sh
./node_modules/.bin/kash run web .
```

The _web_ platform will start a local server:

<img src="https://user-images.githubusercontent.com/169328/51049160-f1710500-15c4-11e9-9e05-b2b6110fe7ec.png" width="80%">

Going to `http://localhost:4000` will load our new app:

<img src="https://user-images.githubusercontent.com/169328/51049159-f03fd800-15c4-11e9-9e6c-10952bf399a1.png" width="60%">

_TODO_ more platforms.

## Development

This repository contains the CLI, core module and platform implementation for the App Shell platform

This repository uses lerna and yarn workspaces to manage dependencies, development and tests of its packages.

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
