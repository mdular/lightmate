var MongoClient = require('mongodb').MongoClient,
    zlib = require ('zlib'),
    http = require('http'),
    db,
    server;

var SerialPort = require('./SerialPort');
var Router = require('./Router');

SerialPort.start(process.env.PORT);
SerialPort.listen(function (message) {
    console.log('recieved serial data:', message);
})

var config = {
  mongoURI: 'mongodb://localhost:27017/lightmate',
  maxPostLength: 1e6, // 1.000.000 bytes
  pixelAmount: 64,
  historyLength: 10,
  defaultHeader: {
    // TODO: set proper origins when deploying this!
    "Access-Control-Allow-Origin" : "*",
    "Content-Encoding": "gzip",
    "X-Server": Math.ceil(Math.random() * 20)
  }
}
Router.configure(config);

Router.actions = {
  draw: function (data, response) {
    //   console.log('draw', data);
      // validate pixels
      if (typeof data === 'undefined' || data.length !== config.pixelAmount) {
          console.dir('invalid draw request', data);
          Router.sendError(response, 400); // Bad request
          return;
      }

      // TODO: write to serialport
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

      Router.sendHeader(response, 200, 'text/html');
      response.end();
  },

  save  : function (id, data, response) {
    var invalid = false,
        update = {};

    // TODO: store IPs / User with history

    // prepare update data
    // TODO: strict validation for expected values!

    // validate pixels
    if (typeof data.pixels !== 'undefined' && data.pixels.length == config.pixelAmount) {
      update.pixels = data.pixels;
    } else {
      invalid = true;
    }

    // validate history
    if (!invalid && typeof data.history !== 'undefined') {
      if (data.history.length > config.historyLength) {
        invalid = true;
      }

      if (data.history.length > 0) {
        for (var i = 0, len = data.history.length; i < len; i++) {
          var frame = data.history[i].frame;

          if (typeof frame === 'undefined' || frame.length !== config.pixelAmount) {
            invalid = true;
          }
        }
      }

      if (!invalid) {
        update.history = data.history ;
      }
    }

    if (invalid) {
      console.dir('invalid save request', data);
      Router.sendError(response, 400); // Bad request
      return;
    }

    db.collection('frames').findAndModify(
      // query
      { reference : id },

      // sort
      { reference : 1},

      // update
      { '$set' : update},

      // options
      {
        new   : true,
        upsert: true
      },

      function (err, doc) {
        if (err) {
          console.dir(err);
          Router.sendError(response, 500); // Internal server error
          return;
        }

        delete doc._id;
        sendJSONResponse(response, doc);
    });
  },

  load  : function (id, response) {
    db.collection('frames').findOne(
    {
      reference : id
    },
    {
      _id     : 0,
      pixels  : 1,
      history : 1
    },
    function (err, doc) {
      if (err) {
        console.dir(err);
        Router.sendError(response, 500); // Internal server error
        return;
      }

      if (!doc) {
        Router.sendError(response, 404, 'Not Found'); // Not found
      } else {
        sendJSONResponse(response, doc);
      }
    });
  }
}

function sendJSONResponse(response, data) {
    zlib.gzip(JSON.stringify(data), function (_, result) {
        Router.sendHeader(response, 200, 'application/x-javascript');
        response.write(result);
        response.end();
        // console.log("server ", id, "responded");
    });
}

MongoClient.connect(config.mongoURI, function (err, dbConnection) {
  if (err) throw err;

  // TODO: handle mongo connection loss?

  db = dbConnection;
  console.dir('mongodb connection established');

  // TODO: handle server independently of app / db connection
  //       > just route / static files
  server = http.createServer(Router.handler);
  server.listen(8888);

  console.dir('http server listening on 8888');
});
