var SerialPort = require('./SerialPort');

var Actions = {
    connect: function (payload) {
        if (payload.result !== 'OK') {
            // TODO: retry?
            console.log('Socket Error: connection attempt failed', payload.result);
            return;
        }

        // this.connected = true;
        console.log('connected');
    },

    draw: function (payload) {
        console.log('draw command pushed');

        // TODO: validate payload
        for (let i in payload.payload) {
            let val = payload.payload[i];

            if (val !== 0) {
                val = val.replace(/#/, '');
              //   val = parseInt(val, 16);
              SerialPort.queue(val);
            } else {
              SerialPort.queue('000000');
            }
        }
    },

    error: function (payload) {
        console.log('Socket Error: received error message', payload.result)
    }
};

module.exports = Actions;
