

# start local dev mongod (assumes brew installation)
mongod -f /usr/local/etc/mongod.conf

# start lightmate server
PORT="/dev/cu.usbmodem1411" node web/application/lightmate-server.js 
