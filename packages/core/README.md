# KASH Core

Set of tools to bundle, transpile and compress apps.

## Creating a project

This guide will explain how to create a minimal project that can be used to output an application on all the platforms supported by kit-app-shell

### index.js

Create an `index.js` file and input the following:

```js
// This is your app main class, the bridge between the shell and your web content
class App {
    // When your app is created, it is given a bus to communicate with the backend and
    // a config object containing your project's config
    constructor(bus, config) {
        // kit-app-shell will be looking for this property to be set as the root of your DOM tree
        this.root = document.createElement('div');
        // Show something
        this.root.innerText = 'Hello World'
    }
}

// By calling this method, you provide the shell your App class and it will be used to start the app
Shell.define(App);
```

With this simple configuration, you can already run `kash run web ./` in your project's directory (Make sure you have `@kano/kit-app-shell-web` installed) and open a browser to the given URL.
You should now see your `Hello World` message.

### Environment and config

Each app is ran or built for a target environment. This environment can be defined using the `--env` flag with the CLI, its default value will be `development`
Config managment for your project is done through a set of JSON files under your project's `config` directory.

Create a `config` directory and a `default.json` inside. The `default.json` file will always be loaded, but its values can be overriden by a config file matching an environment.
If you add a `development.json` file both default and development config will be loaded and values in the development config will override the default values.
Common environments are `staging`, `production`, `rc`, `test`.

You can retrieve the app's environment at runtime through the `ENV` property in the config object.

In your newly created `default.json`, add the following:

```json
{
    "APP_ID": "com.acme.app",
    "APP_NAME": "My App"
}
```

Then update your `index.js`:

```js
class App {
    constructor(bus, config) {
        this.root = document.createElement('div');
        this.root.innerText = `${config.APP_NAME} - ${config.ENV}`;
    }
}

Shell.define(App);
```

Refreshing your browser page should now display the message `My App - development`, you can try running `kash run web ./ --env=<env>` with different environment to see the changes

### Versioning

The version of the app will be loaded from your project's `package.json` and will be added to the config object under the `VERSION` key.

Add a `package.json` file in your project if it doesn;t already have one. Set the `version` field to a custom version.

Update your `index.js` again to use the `VERSION` key from the config:

```js
this.root.innerText = `${config.APP_NAME} - ${config.ENV} running version ${config.VERSION}`;
```
