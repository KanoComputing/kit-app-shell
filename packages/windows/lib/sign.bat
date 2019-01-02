@set ROOT=%CD:~0,3%
@set WDK_BIN_ROOT=%ROOT%Program Files (x86)\Windows Kits\10\bin\x86\
@set SIGNTOOL_CMD="%WDK_BIN_ROOT%signtool.exe"

@%SIGNTOOL_CMD% sign /a /t http://timestamp.digicert.com /n "Kano Computing" %1

