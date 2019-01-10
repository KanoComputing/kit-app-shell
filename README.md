# Kit App Shell Monorepo

## Usage

```
yarn add @kano/kit-app-shell-cli
yarn add @kano/kit-app-shell-macos

kash run macos ./ # Current directory being an app directory 
```

For the full CLI documentation see [@kano/kit-app-shell-cli](./packages/cli)

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

## [@kano/kit-app-shell-test](./packages/test)

Utilities to run tests on remote device providers.

## Platform Libraries

### [@kano/kit-app-shell-electron](./packages/electron)

Kash desktop platform. Runs your app using electron. To build for desktop, use `windows` or `macos`.

### [@kano/kit-app-shell-cordova](./packages/cordova)

Uses the cordova project to create mobile apps.

## Target Platforms

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
