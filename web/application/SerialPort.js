var SP = require("serialport");

var SerialPort = {
    sp: {},

    start: function (port) {
        SP.list(function (err, ports) {
            if (err) throw new Error(err);

            console.log(ports);
        });

        this.sp = new SP(port, {
            baudRate: 9600,
            parser: SP.parsers.readline('\r\n')
            // parser: SP.parsers.raw
        });

        this.sp.on('open', function () {
            console.log('serial connection established with', port);
        })

        this.sp.on('error', function (err) {
            console.log(err);
        })

        this.sp.on('disconnect', function (err) {
            console.log('serial connection was disconnected', err);
        });

        this.sp.on('close', function () {
            console.log('serial connection was closed.');
        });
    },

    send: function (data, callback) {
        if (typeof callback !== 'function') {
            throw new Error("callback must be a function");
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
            callback(input);
        });
    }
};

module.exports = SerialPort;
