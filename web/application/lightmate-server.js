var MongoClient = require('mongodb').MongoClient,
    db,
    http = require('http'),
    server;

var config = {
  mongoURI: 'mongodb://localhost:27017/lightmate',
  maxPostLength: 1e6, // 1.000.000 bytes
  pixelAmount: 64,
  historyLength: 10,
  defaultHeader: {
    // TODO: set proper origins when deploying this!
    "Access-Control-Allow-Origin" : "*"
  }
}

function requestHandler(req, response) {
  var params = req.url.split('/');
  params.shift();

  if (req.method === 'GET') {
    routeRequest(params, response, null);
  } else if (req.method === 'POST') {
    // TODO: csrf token validation
    //       (needs to be persisted and rendered in template too...)
    // currently this is an unlimited open write!

    var body = '';
    req.on('data', function (data) {
      body += data;

      if (body.length > config.maxPostLength) {
        sendError(response, 413); // Request Entity Too Large
        request.connection.destroy();
      }
    });
    req.on('end', function () {
      var data = JSON.parse(body);

      routeRequest(params, response, data);
    });
  }
}

function routeRequest(params, response, postData) {
  // TODO: serve static files
  // TODO: default route
  // TODO: route actions
  // TODO: simple render

  console.log("request", params);

  if (typeof params[1] === 'undefined') {
    if (params[0] === 'favicon.ico') {
      return;
    }
    actions.load(params[0], response);
  } else if (params[1] === 'save') {

    actions.save(params[0], postData, response);
  } else {
    sendError(response, 404, 'Not found');
  }

  // TODO: test if action exists
  // TODO: call actions with try catch, log error
}

var actions = {
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
  sendHeader(response, 200, 'application/x-javascript');
  response.write(JSON.stringify(data));
  response.end();
}

MongoClient.connect(config.mongoURI, function (err, dbConnection) {
  if (err) throw err;

  // TODO: handle mongo connection loss?

  db = dbConnection;
  console.dir('mongodb connection established');

  // TODO: handle server independently of app / db connection
  //       > just route / static files
  server = http.createServer(requestHandler);
  server.listen(8888);

  console.dir('http server listening on 8888');
});
