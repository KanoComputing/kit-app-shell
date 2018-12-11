# Kit App Shell Monorepo

## Usage

```
yarn add @kano/kit-app-shell-cli
yarn add @kano/kit-app-shell-macos

kash run macos ./ # Current directory being an app directory 
```

## Development

This repository contains the CLI, core module and platform implementation for the App Shell platform

This repository uses lerna and yarn workspaces to manage dependencies, development and tests of its packages.

To start, run `lerna bootstrap` then you can work on one of the following:

## [@kano/kit-app-shell-core](./packages/core)

Kash core. Contains the platforms shared features. Used to bundle, run or test apps.
Also contains utilities like logging and config loading

## [@kano/kit-app-shell-cli](./packages/cli)

Kash CLI. Run, build, test from your command line

## [@kano/kit-app-shell-web](./packages/web)

Kash web platform. Runs your app in a browser. Builds a hostable website.

## [@kano/kit-app-shell-electron](./packages/electron)

Kash desktop platform. Runs your app using electron. To build for desktop, use `windows` or `macos`.

## [@kano/kit-app-shell-windows](./packages/windows)

Extends the electron platform. Used to build a windows application and create an installer

## [@kano/kit-app-shell-windows-store](./packages/windows-store)

Extends the windows platform and builds an `appx` package instead of a windows installer

## [@kano/kit-app-shell-macos](./packages/macos)

Extends the electron platform. Used to build a macOS application and create a `.app` package

## [@kano/kit-app-shell-kano](./packages/kano)

Extends the electron platform. Used to build a kanoOS application and create a `.deb` package

## [@kano/kit-app-shell-cordova](./packages/cordova)

Uses the cordova project to create mobile apps

## [@kano/kit-app-shell-android](./packages/android)

Extends the cordova platform to create a .apk

## [@kano/kit-app-shell-android-legacy](./packages/android-legacy)

Extends the android platform to create a .apk using crosswalk as a webview

## [@kano/kit-app-shell-ios](./packages/ios)

Extends the cordova platform to create an iOS app
