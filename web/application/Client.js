var EventEmitter = require('events').EventEmitter;
var util = require('util');

var Client = function (ref) {
    EventEmitter.call(this); // super()

    this.connected = Client.prototype.connected;
    this.ref = ref || Client.prototype.ref;
    this.connection = Client.prototype.connection;
    this.connect = Client.prototype.connect;
    this.disconnect = Client.prototype.disconnect;
};

Client.prototype = {
    connected: false,
    ref: null,
    connection: null,

    connect: function (connection) {
        this.connection = connection;
        this.connected = true;
        console.log("client connected", this.ref);
    },

    disconnect: function (callback) {
        // TODO: disconnect socket if open

        this.connection = null;
        this.connected = false;

        // TODO: store disconnect time to unload from mem after a while
        // client.disconnectedOn = timestamp

        console.log("client disconnected", this.ref);
        callback(false);
    },

    draw: function (frame, callback) {
        if (!this.connected) {
            console.log('cannot draw: client is not connected');
            return;
        }

        // TODO: send frame to client, return OK
        this.connection.write(JSON.stringify({
            action: 'draw',
            payload: frame
        }), () => {
            callback(false);
        });
    },
};

// This is roughly equivalent to: Client.prototype = Object.create(EventEmitter.prototype)
util.inherits(Client, EventEmitter);

module.exports = Client;
