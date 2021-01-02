const Actions = require('./Actions');
const SerialPort = require('./SerialPort');
const SocketClient = require('./SocketClient');
const SerialDevice = require('./SerialDevice');

// TODO: receive a token first from http server (to link with account)
// TODO: watch connections (socket, serial)
// TODO: attempt reconnects (socket, serial)
// TODO: report status (socket, serial)

SerialPort.port = '/dev/tty.lightmate-DevB';
const device = new SerialDevice();
device.setAdapter(SerialPort);

Actions.device = device;
var client = new SocketClient({hostname: 'localhost', port: 8124}, Actions);

client.connect();

// device.list();
device.start();
