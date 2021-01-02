var SerialPort = require('./SerialPort');

var Actions = {
    device: null,

    // setDevice: function (device) {
    //     this.device = device;
    // },

    connect: function (payload) {
        if (payload.result !== 'OK') {
            // TODO: retry?
            console.log('Socket Error: connection attempt failed', payload.result);
            return;
        }

        // this.connected = true;
        console.log('client connected');
    },

    draw: function (payload) {
        console.log('draw command pushed');
        // TODO: validate payload

        this.device.drawFrame(payload);
    },

    error: function (payload) {
        console.log('Socket Error: received error message', payload.result)
    }
};

module.exports = Actions;
