/**
 * @typedef { import('@kano/kit-app-shell-core/types').RunConfig } RunConfig
 * @typedef { import('@kano/kit-app-shell-core/types').BuildConfig } BuildConfig
 * @typedef { import('@kano/kit-app-shell-core/types').TestConfig } TestConfig
 */

/**
 * @typedef {Object} IOSConfig
 * @property {String} deploymentTarget Target device version. E.g. 9.0, 10.0, ...
 * @property {'handset'|'tablet'|'universal'} targetDevice Target devices for this app
 * @property {Object} preferences Cordova preferences. See https://cordova.apache.org/docs/en/latest/config_ref/#preference
 * @property {BuildConfig} build Build config for the android platform
 * @property {RunConfig} run Run config for the android platform
 * @property {TestConfig} test Test config for the android platform
 */

/**
 * @type {IOSConfig}
 */
export {};
