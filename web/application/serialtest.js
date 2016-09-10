var SerialPort = require('./SerialPort');

// SerialPort.start('/dev/cu.usbmodem1411');
SerialPort.start('/dev/cu.lightmate-DevB');
SerialPort.listen(function (message) {
    console.log('recieved serial data:', message);
})


process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (input) {
    input = input.replace('\n', '');
    // input = parseInt(input);

    console.log('received input:', input, parseInt(input, 16));
    //String.fromCharCode(parseInt(input, 16))
    SerialPort.send(input + '\n', function (err, result) {
        if (err) throw new Error(err);

        // console.log('write result (bytes):', result);
    })

    if (input === 'quit\n') {
      quit();
    }
});

function quit() {
    console.log('bye');
    process.exit();
}
