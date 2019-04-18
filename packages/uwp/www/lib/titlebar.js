function hexToRgba(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 255,
    } : null;
}

export function applyTitleBarCustomisations(config) {
    if (!('Windows' in window) || !config.UWP || !config.UWP.TITLEBAR) {
        return;
    }
    const { TITLEBAR } = config.UWP;
    var titleBar = Windows.UI.ViewManagement.ApplicationView.getForCurrentView().titleBar;
    const props = {
        FOREGROUND_COLOR: 'foregroundColor',
        BACKGROUND_COLOR: 'backgroundColor',
        BUTTON_FOREGROUND_COLOR: 'buttonForegroundColor',
        BUTTON_BACKGROUND_COLOR: 'buttonBackgroundColor',
        BUTTON_HOVER_FOREGROUND_COLOR: 'buttonHoverForegroundColor',
        BUTTON_HOVER_BACKGROUND_COLOR: 'buttonHoverBackgroundColor',
        BUTTON_PRESSED_FOREGROUND_COLOR: 'buttonPressedForegroundColor',
        BUTTON_PRESSED_BACKGROUND_COLOR: 'buttonPressedBackgroundColor',
        INACTIVE_FOREGROUND_COLOR: 'inactiveForegroundColor',
        INACTIVE_BACKGROUND_COLOR: 'inactiveBackgroundColor',
        BUTTON_INACTIVE_FOREGROUND_COLOR: 'buttonInactiveForegroundColor',
        BUTTON_INACTIVE_BACKGROUND_COLOR: 'buttonInactiveBackgroundColor',
    }
    Object.keys(props).forEach((src) => {
        if (TITLEBAR[src]) {
            titleBar[props[src]] = hexToRgba(TITLEBAR[src]);
        }
    });
}
