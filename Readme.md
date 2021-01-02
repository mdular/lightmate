# lightmate
Browser > POST /draw > Server <> Socket <> Client <(())> Bluetooth <(())> Arduino > LEDs

## Install dependencies
    npm install

loading and saving data requires mongodb running on ```localhost:27017```

#### Start local development mongod (assumes brew installation)
    mongod -f /usr/local/etc/mongod.conf

#### Start lightmate server
    node web/server/server.js

or using pm2:

    node_modules/.bin/pm2 start web/server/server.js
    node_modules/.bin/pm2 restart web/server/server.js
    node_modules/.bin/pm2 stop web/server/server.js

    node_modules/.bin/pm2 logs server

    node_modules/.bin/pm2 monit

    ./node_modules/.bin/pm2 start server --watch

#### Start lightmate client
Requires paired bluetooth **or** plugged in USB serial, `PORT` will vary depending on OS

    PORT="/dev/cu.lightmate-DevB" node client/client.js

    PORT="/dev/cu.lightmate-DevB" ./node_modules/.bin/pm2 start client/client.js

    PORT=/dev/rfcomm0 SERVER=localhost:8124 node client/client.js

    PORT=/dev/rfcomm0 SERVER=localhost:8124 node_modules/.bin/pm2 start client/client.js --watch

    ./node_modules/.bin/pm2 start client --watch

#### monitor PM2 processes

    node_modules/.bin/pm2 monit

#### Access the web UI (or setup a static file server)
    file:///PATH-TO-PROJECT/web/public/index.html


## Setup client on a Raspberry Pi 0 (W or IoT pHAT)

### Verify the bluetooth device is available

    $ hcitool dev

    Devices:
    	hci0	AA:BB:CC:DD:EE:FF

    (I needed to flash the eeprom of the IoT pHAT, was v0.3)

### Scan for lightmate

    $ hcitool scan

    Scanning ...
	   XX:XX:XX:XX:XX:XX	lightmate

### Pairing

    $ bluetoothctl

    [bluetooth] power on
    [bluetooth] agent on
    [bluetooth] scan on
    [bluetooth] pair XX:XX:XX:XX:XX:XX
    [bluetooth] connect XX:XX:XX:XX:XX:XX
    [bluetooth] trust XX:XX:XX:XX:XX:XX
    [bluetooth] quit

### Connect

    $ sudo rfcomm connect hci0 XX:XX:XX:XX:XX:XX

    Connected /dev/rfcomm0 to XX:XX:XX:XX:XX:XX on channel 1

    sudo rfcomm bind hci0 XX:XX:XX:XX:XX:XX

    sudo PORT=/dev/rfcomm0 SERVER=localhost:8124 node client/client.js
