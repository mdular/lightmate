var SP = require("serialport");
const Readline = require('@serialport/parser-readline')

var SerialPort = {
    sp: null,
    connected: false,
    connecting: false,
    port: null,

    list: function () {
        SP.list(function (err, ports) {
            if (err) throw new Error(err);

            console.log(ports);

            // TODO: search for lightmate, use that port if not specified
        });
    },

    start: function () {
        if (this.connecting) {
            return;
        }

        if (process.env.PORT) {
            this.port = process.env.PORT;
        }

        this.connecting = true;

        this.sp = new SP(this.port, {
            baudRate: 9600,
            dataBits: 8,
            parity: 'none',
            stopBits: 1,
            flowControl: false
        });

        this.sp.pipe(new Readline({ delimiter: '\r\n' }));

        this.sp.on('data', console.log);

        this.sp.on('open', () => {
            console.log('serial connection established with', this.port);

            this.listen (function (err, message) {
                if (err) {
                    console.dir(err);
                    return;
                }

                // TODO: process response from arduino: "frame complete"

                console.log('recieved serial data:', message);
            });

            setTimeout(() => {
                this.connected = true;
                this.connecting = false;
                // this.run();
            }, 100);
        })

        this.sp.on('error', function (err) {
            console.log(err);
        })

        this.sp.on('disconnect', function (err) {
            console.log('serial connection was disconnected', err);
            this.sp = null;
            this.connected = false;
        });

        this.sp.on('close', function () {
            console.log('serial connection was closed.');
            this.sp = null;
            this.connected = false;
        });
    },

    send: function (data, callback) {
        if (typeof callback !== 'function') {
            throw new Error("callback must be a function");
        }

        if (this.connected === false) {
            callback()
        }

        this.sp.write(data, function () {
            this.sp.drain(callback)
        }.bind(this));
    },

    listen: function (callback) {
        if (typeof callback !== 'function') {
            throw new Error("callback must be a function");
        }

        this.sp.on('data', function (input) {
            callback(false, input);
        });
    },

    // draw: function (payload) {
    //     for (let i in payload.payload) {
    //         let val = payload.payload[i];

    //         if (val !== 0) {
    //             val = val.replace(/#/, '');
    //           //   val = parseInt(val, 16);
    //           this.queue(val);
    //         } else {
    //           this.queue('000000');
    //         }
    //     }
    // }
};

module.exports = SerialPort;
