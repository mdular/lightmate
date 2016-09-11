// run

// connect to server
// connect to serialport
var SerialPort = require('./SerialPort');
SerialPort.start(process.env.PORT);
SerialPort.listen(function (message) {
    console.log('recieved serial data:', message);
})

// watch connections
// attempt reconnects
// report status



// receive frames


// write via serial queue
// write to serialport
for (let i in data) {
    let val = data[i];

    // simulate 4 pixel (24 byte) packet
  //   if (i > 15) {
  //       break;
  //   }

    if (val !== 0) {
        val = val.replace(/#/, '');
      //   val = parseInt(val, 16);

      //   var r = (val >> 16) & 255;
      //   var g = (val >> 8) & 255;
      //   var b = val & 255;

      //   console.log( r + "," + g + "," + b);
      //   serial.queue(r);
      //   serial.queue(g);
      //   serial.queue(b);
      SerialPort.queue(val);
    } else {
      //   serial.queue(0);
      //   serial.queue(0);
      //   serial.queue(0);
      SerialPort.queue('000000');
    }
}
