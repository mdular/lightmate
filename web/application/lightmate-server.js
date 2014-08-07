var mongoURI = 'mongodb://127.0.0.1:27017',
    MongoClient = require('mongodb').MongoClient,
    db,
    http = require('http'),
    server;

var config = {
  maxPostLength: 1e6, // 1.000.000 bytes
  defaultHeader: {
    // TODO: set proper origins when deploying this..
    "Access-Control-Allow-Origin" : "*" 
  }
}

function requestHandler(req, response) {
  var params = req.url.split('/');
  params.shift();

  console.dir(req.method);

  if (req.method === 'GET') {
    try {
      routeRequest(params, response, null);
    } catch (err) {
      sendError(response, 400); // Bad Request
      //response.end();
    }
  } else if (req.method === 'POST') {
    var body = '';
    req.on('data', function (data) {
      body += data;

      if (body.length > config.maxPostLength) {
        sendError(response, 413); // Request Entity Too Large
        //response.end();
        request.connection.destroy();
      }
    });
    req.on('end', function () {
      try {
        var data = JSON.parse(body);
        // TODO: sanitize
        routeRequest(params, response, data);
      } catch (err) {
        sendError(response, 400); // Bad Request
        //response.end();
      }
    });
  }
}

function routeRequest(params, response, postData) {
  if (typeof params[1] === 'undefined') {
    if (params[0] === 'favicon.ico') {
      return;
    }
    actions.load(params[0], response);
  } else if (params[1] === 'save') {

    actions.save(params[0], postData, response);
  } else {
    throw new Error();
  }
}

var actions = {

  save  : function (id, data, response) {

    // prepare data
    var update = {};
    if (typeof data.pixels !== 'undefined' && data.pixels.length > 0) {
      update[$set] = { pixels : data.pixels };
    }
    if (typeof data.history !== 'undefined' && data.history.length > 0) {
      update[$set] = { history : data.history };
    }

    db.collection('frames').findAndModify(
      { reference : id }, // query
      { reference : 1}, // sort
      update, // update doc
      { // options
        new   : true,
        upsert: true
      }, 
      function (err, doc) {
        if (err) {
          console.dir(err);
          sendError(response, 500); // Internal server error
          return;
        }

        sendHeader(response, 200, 'application/x-javascript');
        response.write(JSON.stringify(doc));
        response.end();
    });
  },

  load  : function (id, response) {
    db.collection('frames').findOne({
      reference : id
    }, function (err, doc) {
      if (err) {
        console.dir(err);
        return;
      }

      if (!doc) {
        sendError(response, 404, 'not found'); // Not found
      } else {
        sendHeader(response, 200, 'application/x-javascript');
        response.write(JSON.stringify(doc));
        response.end();
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

MongoClient.connect('mongodb://localhost:27017/lightmate', function (err, dbConnection) {
  if (err) throw err;

  db = dbConnection;
  console.dir('mongodb connection established');

  server = http.createServer(requestHandler);
  server.listen(8888);

  console.dir('http server listening on 8888');
});
