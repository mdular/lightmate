var MongoClient = require('mongodb').MongoClient,
    zlib = require ('zlib'),
    http = require('http'),
    db,
    server;

var Router = require('./Router');

var id = Math.ceil(Math.random() * 20);

var config = {
  mongoURI: 'mongodb://localhost:27017/lightmate',
  maxPostLength: 1e6, // 1.000.000 bytes
  pixelAmount: 64,
  historyLength: 10,
  defaultHeader: {
    // TODO: set proper origins when deploying this!
    "Access-Control-Allow-Origin" : "*",
    "Content-Encoding": "gzip",
    "X-Server": id
  }
}

Router.configure(config);

Router.actions = {
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
      sendError(response, 400); // Bad request
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
          sendError(response, 500); // Internal server error
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
        sendError(response, 500); // Internal server error
        return;
      }

      if (!doc) {
        sendError(response, 404, 'Not Found'); // Not found
      } else {
        sendJSONResponse(response, doc);
      }
    });
  }
}

function sendError(response, statusCode, message) {
  sendHeader(response, statusCode, 'text/plain');
  if (typeof message !== 'undefined') {
    response.write(message);
  }
  response.end();
}

function sendHeader(response, statusCode, contentType) {
  var header = config.defaultHeader;
  header["Content-Type"] = contentType;

  response.writeHead(statusCode, header);
}

function sendJSONResponse(response, data) {
    zlib.gzip(JSON.stringify(data), function (_, result) {
        sendHeader(response, 200, 'application/x-javascript');
        response.write(result);
        response.end();
        console.log("server ", id, "responded");
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
