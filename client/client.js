var net = require ("net");
var SerialPort = require('./SerialPort');

// TODO: receive a token first from http server (to link with account)
// TODO: watch connections (socket, serial)
// TODO: attempt reconnects (socket, serial)
// TODO: report status (socket, serial)

var connected = false;

// connect to server
var connection = net.createConnection({
    port: 8124,
    host: 'localhost'
}, () => {
    console.log('connected to server');

    // TODO: handle connection failures, retry

    // send connection package
    // TODO: generate, store client reference, based on device MAC?
    connection.write(JSON.stringify({
        action: 'connect',
        payload: {
            ref: 'A',
            token: 123
        }
    }));
});

connection.on('data', (data) => {
    try {
        data = JSON.parse(data);
    } catch (err) {
        console.log("Error: json parsing failed", err);
        return;
    }

    // handle data.action
    switch (data.action) {
        case 'connect':
            if (data.result !== 'OK') {
                // TODO: retry?
                console.log('Socket Error: connection attempt failed', data.result);
                break;
            }

            connected = true;
            break;
        case 'draw':
            console.log('draw command pushed');

            // TODO: validate payload

            for (let i in data.payload) {
                let val = data.payload[i];

                if (val !== 0) {
                    val = val.replace(/#/, '');
                  //   val = parseInt(val, 16);
                  SerialPort.queue(val);
                } else {
                  SerialPort.queue('000000');
                }
            }

            break;
        case 'error':
            console.log('Socket Error: received error message', data.result)
            break;
        default:
            console.log('Socket Error: action could not be handled', data.action);
            break;
    }
});

// connect to serialport
var SerialPort = require('./SerialPort');
SerialPort.start(process.env.PORT);
SerialPort.listen(function (message) {
    // TODO: process response from arduino: "frame complete"

    console.log('recieved serial data:', message);
})
