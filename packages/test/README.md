# `@kano/kit-app-shell-test`

Provides tools to run tests and across platforms.

This module allows tests to run on cloud based real device, emulators and simulators providers. Available providers are:

 - Browserstack
 - Bitbar
 - Kobiton
 - SauceLabs

## Installation

```
yarn global add @kano/kit-app-shell-test
```

## Usage

Start by configuring your local machine with

```
kash configure test
```

Choose a provider, input your credentials and they will be saved in your RC file. You can change the values at any time by running the same command again. To open your RC file run `kash open config`.


