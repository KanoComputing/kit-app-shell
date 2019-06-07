import { IBuildOptions, IRunOptions } from '@kano/kit-app-shell-core/lib/types';

// From cordova documentation. See https://cordova.apache.org/docs/en/latest/guide/appdev/hooks/
export interface IHooks {
    before_platform_add? : string[];
    after_platform_add? : string[];
    before_platform_rm? : string[];
    after_platform_rm? : string[];
    before_platform_ls? : string[];
    after_platform_ls? : string[];
    before_prepare? : string[];
    after_prepare? : string[];
    before_compile? : string[];
    after_compile? : string[];
    before_deploy? : string[];
    before_build? : string[];
    after_build? : string[];
    before_emulate? : string[];
    after_emulate? : string[];
    before_run? : string[];
    after_run? : string[];
    before_serve? : string[];
    after_serve? : string[];
    before_clean? : string[];
    after_clean? : string[];
    pre_package? : string[];
    before_plugin_add? : string[];
    after_plugin_add? : string[];
    before_plugin_rm? : string[];
    after_plugin_rm? : string[];
    before_plugin_ls? : string[];
    after_plugin_ls? : string[];
    before_plugin_search? : string[];
    after_plugin_search? : string[];
    before_plugin_install? : string[];
    after_plugin_install? : string[];
    before_plugin_uninstall? : string[];
}

export interface ICordovaPreferences {
    AllowInlineMediaPlayback? : boolean;
    AndroidLaunchMode? : string;
    ['android-maxSdkVersion']? : number;
    ['android-minSdkVersion']? : number;
    ['android-targetSdkVersion']? : number;
    AppendUserAgent? : string;
    BackgroundColor? : string;
    BackupWebStorage? : string;
    CordovaWebViewEngine? : string;
    CordovaDefaultWebViewEngine? : string;
    DefaultVolumeStream? : string;
    DisallowOverscroll? : boolean;
    EnableViewportScale? : boolean;
    EnableWebGL? : boolean;
    ErrorUrl? : string;
    ForegroundText? : string;
    FullScreen? : boolean;
    GapBetweenPages? : number;
    HideMousePointer? : number;
    InAppBrowserStorageEnabled ? : boolean;
    KeepRunning? : boolean;
    KeyboardDisplayRequiresUserAction? : boolean;
    LoadUrlTimeoutValue? : number;
    LoadingDialog? : string;
    LogLevel? : string;
    MediaPlaybackAllowsAirPlay? : boolean;
    MediaPlaybackRequiresUserAction? : boolean;
    ['Min/Max Version']? : RegExp;
    Orientation? : string;
    OSXLocalStoragePath? : string;
    OverrideUserAgent? : string;
    PageLength? : number;
    PaginationBreakingMode? : string;
    PaginationMode? : string;
    SetFullscreen? : boolean;
    ShowTitle? : boolean;
    SplashScreenBackgroundColor? : string;
    Suppresses3DTouchGesture? : boolean;
    SuppressesIncrementalRendering? : boolean;
    SuppressesLongPressGesture? : boolean;
    TopActivityIndicator? : string;
    ['uap-target-min-version']? : string;
    UIWebViewDecelerationSpeed? : string;
    WindowSize? : string;
    WindowsDefaultUriPrefix? : string;
    WindowsStoreDisplayName? : string;
    WindowsStoreIdentityName? : string;
    WindowsStorePublisherName? : string;
    WindowsToastCapable? : boolean;
    ['deployment-target']? : string;
    ['target-device']? : string;
    ['windows-phone-target-version']? : string;
    ['windows-target-version']? : string;
}

export interface ICordovaOptions {
    plugins : string[];
    platforms : string[];
    hooks : IHooks;
    cacheId : string;
    preferences : ICordovaPreferences;
}

export interface ICordovaBuildOptions extends ICordovaOptions, IBuildOptions {
    clean? : string[];
    run : boolean;
    buildOpts : { [K : string] : any };
}

export type CordovaRunOptions = ICordovaOptions & IRunOptions;
