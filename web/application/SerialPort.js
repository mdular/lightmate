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
            dataBits: 8,
            parity: 'none',
            stopBits: 1,
            flowControl: false,
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
    },

    /**
     * Queue
     */
    q: [],
    running: false,
    time: null,
    queue: function (data) {
        this.q.push(data);
        this.time = new Date();
        this.run();
    },
    run: function () {
        if (this.running) {
            return;
        }

        if (!this.q.length) {
            this.running = false;
            console.log('serial queue drained after ' + ((new Date()).getTime() - this.time.getTime()) + ' msec');
            return;
        }

        this.running = true;
        // console.log('running queue', this.q.length);

        let val = this.q.shift();
        // console.log('writing', val);
        //  + val + '\n' + val + '\n' + val + '\n'
        this.send(val + '\n', function (err, result) {
            if (err) throw new Error(err);

            // console.log('write result (bytes):', result);
            // workaround for Abort trab: 6 issue
            setTimeout(function () {
                this.running = false;
                this.run();
            }.bind(SerialPort), 1);
        });
    }
};

module.exports = SerialPort;
