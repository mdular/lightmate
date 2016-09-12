# lightmate
Browser > POST /draw > Server > Socket > Client )) Bluetooth )) Arduino > LEDs

## Install dependencies
    npm install

loading and saving data requires mongodb running on ```localhost:27017```

#### Start local development mongod (assumes brew installation)
    mongod -f /usr/local/etc/mongod.conf

#### Start lightmate server
    node web/application/server.js

#### Start lightmate client
Requires paired / plugged in USB serial, PORT will vary depending on OS

    PORT="/dev/cu.lightmate-DevB" node client/client.js

#### Access the web UI (or setup a static file server)
    file:///PATH-TO-PROJECT/web/public/index.html
