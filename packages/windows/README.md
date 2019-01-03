# Kash windows

Generates a windows installer

## Setup

In your project's config files add the following:

```json
{
    "ICONS": {
        "WINDOWS": "<path to icon>",
        "WINDOWS_INSTALLER": "<path to icon>",
        "WINDOWS_INSTALLER_BIG": "<path to icon>",
        "MIN_WINDOWS_VERSION": "<Min supported version for this app>",
        "MANUFACTURER": "<Manufacturer>"
    }
}
```

All the icons are resolved from the root of your project. These images must have the right extension and format:

`WINDOWS`: App icon, used in taskbar and titlebar .ico -> 256x256
`WINDOWS_INSTALLER`: Installer icon used in installer menu .bmp -> 410x797
`WINDOWS_INSTALLER_BIG`: Installer Left pane icon .bmp -> 138x140

Default icons will be used is not provided.

`MIN_WINDOWS_VERSION`: See http://www.jrsoftware.org/ishelp/index.php?topic=setup_minversion. Default to `10.0.15014`

`MANUFACTURER`: Is used in the metadata of the generated app

## Development

This platform uses `electron-packager` to create a windows application from your project.
This application is then used to create a windows Innosetup installer using the `installer.iss` script
