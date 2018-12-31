/**
 * @typedef { import('@kano/kit-app-shell-core/types').RunConfig } RunConfig
 * @typedef { import('@kano/kit-app-shell-core/types').BuildConfig } BuildConfig
 * @typedef { import('@kano/kit-app-shell-core/types').TestConfig } TestConfig
 */

/**
 * @typedef {Object} supportsScreens Android Screen filtering. See https://developer.android.com/guide/topics/manifest/supports-screens-element
 * @property {Boolean} resizeable
 * @property {Boolean} anyDensity
 * @property {Boolean} smallScreens
 * @property {Boolean} normalScreens
 * @property {Boolean} largeScreens
 * @property {Boolean} xlargeScreens
 * @property {Number} requiresSmallestWidthDp
 * @property {Number} compatibleWidthLimitDp
 * @property {Number} largestWidthLimitDp
 */

/**
 * @typedef {Object} AndroidConfig
 * @property {supportsScreens} supportsScreens
 * @property {Number} minSdkVersion
 * @property {Number} maxSdkVersion
 * @property {Object} preferences Cordova preferences. See https://cordova.apache.org/docs/en/latest/config_ref/#preference
 * @property {BuildConfig} build Build config for the android platform
 * @property {RunConfig} run Run config for the android platform
 * @property {TestConfig} test Test config for the android platform
 */

/**
 * @type {AndroidConfig}
 */
export {};
