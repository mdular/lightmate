var SP = require("serialport");
const Readline = require('@serialport/parser-readline')

var SerialPort = {
    sp: null,
    connected: false,
    connecting: false,

    list: function () {
        SP.list(function (err, ports) {
            if (err) throw new Error(err);

            console.log(ports);

            // TODO: search for lightmate, use that port if not specified
        });
    },

    start: function (port) {
        if (this.connecting) {
            return;
        }

        if (process.env.PORT) {
            port = process.env.PORT;
        }

        this.connecting = true;

        this.sp = new SP(port, {
            baudRate: 9600,
            dataBits: 8,
            parity: 'none',
            stopBits: 1,
            flowControl: false
        });

        this.sp.pipe(new Readline({ delimiter: '\r\n' }));

        this.sp.on('data', console.log);

        this.sp.on('open', () => {
            console.log('serial connection established with', port);

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
                this.run();
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

        if (this.connected === false) {
            this.start();
            return;
        }

        if (this.q.length <= 0 && this.time !== null) {
            this.running = false;
            console.log('serial queue drained after ' + ((new Date()).getTime() - this.time.getTime()) + ' msec');
            this.time = null;
            return;
        }

        if (this.q.length <= 0) {
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
