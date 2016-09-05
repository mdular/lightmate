var SP = require("serialport");

var SerialPort = {
    sp: {},

    start: function (port) {
        this.sp = new SP(port, {
            baudRate: 9600,
            dataBits: 8,
            parity: 'none',
            stopBits: 1,
            flowControl: false,
            parser: SP.parsers.readline('\r\n')
        });

        this.sp.on('open', function () {
            console.log('serial connection established with', port);
        })

        this.sp.on('error', function (err) {
            console.log(err);
        })
    },

    send: function (data, callback) {
        if (typeof callback !== 'function') {
            throw new Error("callback must be a function");
        }

        this.sp.write(data, callback);
    },

    listen: function (callback) {
        if (typeof callback !== 'function') {
            throw new Error("callback must be a function");
        }

        this.sp.on('data', function (input) {
            callback(input);
        });
    }
};

module.exports = SerialPort;
