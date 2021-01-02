var EventEmitter = require('events').EventEmitter;
var util = require('util');
var net = require ("net");

var SocketRouter = {
    actions: {},
    //handle: function () {}
};

var SocketClient = function (config, actions) {
    EventEmitter.call(this); // super()
    this.config = config || SocketClient.prototype.config;
    this.actions = actions;
    this.connected = SocketClient.prototype.connected;
    this.connection = SocketClient.prototype.connection;
    this.connect = SocketClient.prototype.connect;
    this.bind = SocketClient.prototype.bind;
    this.send = SocketClient.prototype.send;
    this.setActions = SocketClient.prototype.setActions;

    if (process.env.SERVER) {
        let server = process.env.SERVER.split(':');
        this.config.host = server[0];
        this.config.port = server[1];
    }
};

SocketClient.prototype = {
    config: {
        host: 'localhost',
        port: 8124
    },
    connected: false,
    connection: null,
    actions: {},

    // connect to SocketServer
    connect: function () {
        this.connection = net.createConnection ({
            port: this.config.port,
            host: this.config.host
        }, () => {
            console.log('estabilshed connection to server');

            // TODO: handle connection failures, retry
            // send connection package
            // TODO: generate, store client reference, based on device MAC?
            this.send('connect', {
                ref: 'A',
                token: 123
            });
        });

        this.bind();
    },

    bind: function () {
        this.connection.on('data', (data) => {
            try {
                data = JSON.parse(data);
            } catch (err) {
                console.log("Error: json parsing failed", err);
                return err;
            }

            if (typeof this.actions[data.action] !== 'function') {
                console.log("Socket error: action not found", data);
                return false;
            }

            this.actions[data.action].call(this.actions, data);
        });
    },

    send: function (action, payload) {
        this.connection.write(
            JSON.stringify(
                {
                    action: action,
                    payload: payload
                }
            )
        );
    },

    setActions: function (actions) {
        this.actions = actions;
    }
}

// This is roughly equivalent to: SocketClient.prototype = Object.create(EventEmitter.prototype)
util.inherits(SocketClient, EventEmitter);

module.exports = SocketClient;
