# Kit App Shell Monorepo

This repository contains the CLI, common module and platform implementation for the App Shell platform

This repository uses lerna and yarn workspaces to manage dependencies, development and tests of its packages.

To start, run `lerna bootstrap` then you can work on one of the following:

## [@kano/kit-app-shell-common](./packages/common)

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


