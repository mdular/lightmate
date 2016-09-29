var net = require ("net");
var SerialPort = require('./SerialPort');

// TODO: receive a token first from http server (to link with account)
// TODO: watch connections (socket, serial)
// TODO: attempt reconnects (socket, serial)
// TODO: report status (socket, serial)

var SocketClient = require('./SocketClient');
var client = new SocketClient({hostname: 'localhost', port: 8124});

client.connect();

// connect to serialport
var SerialPort = require('./SerialPort');
SerialPort.list();

setTimeout(() => {
    SerialPort.start(process.env.PORT);
    SerialPort.listen(function (message) {
        // TODO: process response from arduino: "frame complete"

        console.log('recieved serial data:', message);
    });
}, 10000);
