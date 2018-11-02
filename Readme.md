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

    ./node_modules/.bin/pm2 start client --watch

#### monitor PM2 processes

    node_modules/.bin/pm2 monit

#### Access the web UI (or setup a static file server)
    file:///PATH-TO-PROJECT/web/public/index.html
