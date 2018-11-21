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
SerialPort.list();

setTimeout(() => {
    SerialPort.start('/dev/tty.lightmate-DevB');
}, 2000);
