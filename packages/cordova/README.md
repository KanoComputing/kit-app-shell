# KASH cordova

This platform provides common tools to develop, build and test on mobile platforms using the cordova project.

## Extra

The run command uses your IP to setup livereload using your local network.
It tries to guess your IP address but can select the wrong one if you have multiple valid network interfaces (e.g. VirtualBox interfaces).

If you have troubles gettin livereload working, try to set the environment variable `KASH_NET_INTERFACE_NAME` to your network interface name.
This will tell the platform where to look for your local IP.
