[Setup]
AppName={#Name}
AppVersion={#Version}
DefaultDirName={pf}\{#Name}
DefaultGroupName={#Name}
UninstallDisplayIcon={app}\{#Name}.exe
Compression=lzma2
SolidCompression=yes
OutputDir={#OutputDir}
OutputBaseFilename={#OutputName}
PrivilegesRequired=admin
WizardSmallImageFile={#WizardSmallImageFile}
WizardImageFile={#WizardImageFile}
DisableWelcomePage=no
MinVersion={#MinVersion}

[Files]
Source: "{#Source}"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs

[Run]
Filename: "{app}\{#Name}.exe"; Description: "Start {#Name} after finishing installation"; Flags: nowait postinstall

[Icons]
Name: "{group}\{#Name}"; Filename: "{app}\{#Name}.exe"

[Code]
function WizardNotSilent(): Boolean;
begin
  Result := not WizardSilent();
end;